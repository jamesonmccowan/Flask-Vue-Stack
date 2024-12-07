import sqlite3
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Tag(db.Model):
    id          = db.Column(db.Integer,     primary_key=True)
    name        = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text,        nullable=True)

    def __repr__(self):
        return f'<Tag {self.id}: {self.name}>'

    def to_dict(self):
        return {
            'id':          self.id,
            'name':        self.name,
            'description': self.description,
        }

def get_or_create_tags(tag_names_and_ids: list) -> list:
    tags = []
    for name_or_id in tag_names_and_ids:
        if isinstance(name_or_id, str):
            # Normalize the tag name to lowercase
            tag_name = name_or_id.lower()
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.session.add(tag)
                db.session.commit()
            tags.append(tag)
        elif isinstance(name_or_id, int):
            tag = Tag.query.get(name_or_id)
            if tag:
                tags.append(tag)
    return tags


class LinkTags(db.Model):
    link_id = db.Column(db.Integer, db.ForeignKey("link.id"), primary_key=True)
    tag_id  = db.Column(db.Integer, db.ForeignKey("tag.id"),  primary_key=True)

    def __repr__(self):
        return f'<LinkTag {self.link_id} - {self.tag_id}>'

    def to_dict(self):
        return {
            'link_id': self.link_id,
            'tag_id':  self.tag_id,
        }


class Link(db.Model):
    id          = db.Column(db.Integer,     primary_key=True)
    url         = db.Column(db.String(255), nullable=False)
    title       = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text,        nullable=True)
    src         = db.Column(db.String(255), nullable=True)
    created_on  = db.Column(db.DateTime,    default=datetime.now(), nullable=False)

    tags = db.relationship(
        'Tag',
        secondary='link_tags',
        backref=db.backref('links', lazy=True)
    )

    def __repr__(self):
        return f'<Link {self.id}: {self.title}>'

    def to_dict(self):
        return {
            'id':          self.id,
            'url':         self.url,
            'title':       self.title,
            'description': self.description,
            'src':         self.src,
            'created_on':  self.created_on.isoformat(),
            'tags':        [tag.to_dict() for tag in self.tags],
        }

    def add_tag(self, tag: Tag) -> None:
        if not self.tags:
            self.tags.append(tag)

    def remove_tag(self, tag: Tag) -> None:
        if tag in self.tags:
            self.tags.remove(tag)