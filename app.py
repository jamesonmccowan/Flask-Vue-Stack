from flask import Flask, render_template, jsonify, request
from bs4 import BeautifulSoup
import argparse
import requests
import requests

# local file imports
from models import db, Link, Tag, get_or_create_tags

debug=True

# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument('-p', '--port', help='Set the port for the web server', default=55555, type=int)
args = parser.parse_args()

app = Flask(
    __name__,
    static_url_path='/static',
    template_folder='templates'
)
app.jinja_env.variable_start_string = '{['
app.jinja_env.variable_end_string = ']}'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///storage.db'
db.init_app(app)

# Create the database tables if they don't exist
with app.app_context():
    db.create_all()

# Set up links to template pages
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/links')
def links():
    return render_template('links.html')

@app.route('/tags')
def tags():
    return render_template('tags.html')


# link API endpoints
@app.route('/api/links', methods=['GET'])
def get_links():
    links = Link.query.all()
    return jsonify([link.to_dict() for link in links])

@app.route('/api/links', methods=['POST'])
def add_links():
    data = request.get_json()
    new_link = Link(
        url=data['url'],
        title=data['title'],
        description=data['description'],
        src=data['src'],
    )

    # Get the list of tag IDs from the JSON data
    tag_ids = data.get('tags', [])

    # Associate the tags with the new link
    tags = get_or_create_tags(tag_ids)
    for tag in tags:
        new_link.tags.append(tag)

    db.session.add(new_link)
    db.session.commit()
    return jsonify({'message': 'Link created successfully'})

@app.route('/api/links/<int:link_id>', methods=['GET'])
def get_link(link_id):
    link = Link.query.get(link_id)
    if link is None:
        return jsonify({'error': 'Link not found'}), 404
    return jsonify(link.to_dict())

@app.route('/api/links/<int:link_id>', methods=['PUT'])
def update_link(link_id):
    link = Link.query.get(link_id)
    if link is None:
        return jsonify({'error': 'Link not found'}), 404
    data = request.get_json()
    link.url         = data['url']
    link.title       = data['title']
    link.description = data['description']
    link.src         = data['src']

    # Get the updated list of tags from the request body
    tags = get_or_create_tags([tag_name_or_id for tag_name_or_id in request.json['tags']])

    # Remove any existing tags that are not present in the updated list
    for tag in link.tags:
        if tag not in tags:
            link.tags.remove(tag)

    # Add new tags to the link
    for tag in tags:
        if tag not in link.tags:
            link.tags.append(tag)

    db.session.commit()
    return jsonify({'message': 'Link updated successfully'})

@app.route('/api/links/<int:link_id>', methods=['DELETE'])
def delete_link(link_id):
    link = Link.query.get(link_id)
    if link is None:
        return jsonify({'error': 'Link not found'}), 404
    db.session.delete(link)
    db.session.commit()
    return jsonify({'message': 'Link deleted successfully'})

@app.route('/api/link_preview', methods=['POST'])
def get_link_preview():
    data     = request.get_json()
    url      = data['url']
    response = requests.get(url)
    html     = response.content

    # Parse the HTML using BeautifulSoup
    soup = BeautifulSoup(html, 'html.parser')

    # Extract metadata from the web page
    title = soup.title.string if soup.title else ''

    description = ''
    if soup.find('meta', attrs={'name': 'description'}):
        description = soup.find('meta', attrs={'name': 'description'})['content']
    elif soup.find('meta', attrs={'property': 'og:description'}): # <meta property="og:description"
        description = soup.find('meta', attrs={'property': 'og:description'})['content']

    image_url = ''
    if soup.find('meta', attrs={'property': 'og:image'}):
        image_url = soup.find('meta', attrs={'property': 'og:image'})['content']
    elif soup.find('meta', attrs={'name': 'twitter:image'}):
        image_url = soup.find('meta', attrs={'name': 'twitter:image'})['content']
    elif soup.find('meta', attrs={'name': 'parsely-image-url'}):
        image_url = soup.find('meta', attrs={'name': 'parsely-image-url'})['content']

    return {
        'title': title,
        'description': description,
        'image_url': image_url
    }

# tag endpoints
@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags])

@app.route('/api/tags', methods=['POST'])
def add_tags():
    data = request.get_json()
    new_tag = Tag(
        name=data['name'].lower(),
        description=data['description'],
    )
    db.session.add(new_tag)
    db.session.commit()
    return jsonify({'message': 'tag created successfully'})

@app.route('/api/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag is None:
        return jsonify({'error': 'Tag not found'}), 404
    return jsonify(tag.to_dict())

@app.route('/api/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag is None:
        return jsonify({'error': 'Tag not found'}), 404
    data = request.get_json()
    tag.name        = data['name'].lower()
    tag.description = data['description']
    db.session.commit()
    return jsonify({'message': 'Tag updated successfully'})

@app.route('/api/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag is None:
        return jsonify({'error': 'Tag not found'}), 404
    db.session.delete(tag)
    db.session.commit()
    return jsonify({'message': 'Tag deleted successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=args.port, debug=debug)