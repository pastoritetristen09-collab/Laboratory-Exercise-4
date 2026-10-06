import os
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename
import math

app = Flask(__name__)

# Configure upload folder for profile pictures
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# User-modifiable Profile State
profile_data = {
    "name": "Tristen Marie G. Pastorite",
    "section": "BSCPE 2-1",
    "interest": "Python programming, Flask web frameworks, and algorithmic data structures.",
    "image": None
}

# User-modifiable Contact State
contact_data = {
    "email": "tristen@example.com",
    "fbname": "Tristen Marie Pastorite",
    "number": "+63 912 345 6789",
    "github": "https://github.com/pastorite09github",
    "note": "Open for Computer Engineering collaborations and magical code projects."
}

# Linked List Implementation with Head & Tail Deletion
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def remove_head(self):
        if self.head:
            self.head = self.head.next

    def remove_tail(self):
        if not self.head:
            return
        if not self.head.next:
            self.head = None
            return
        current = self.head
        while current.next.next:
            current = current.next
        current.next = None

    def clear(self):
        self.head = None

    def to_list(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements

my_linked_list = LinkedList()
my_linked_list.append("Lumos")
my_linked_list.append("Nox")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    global profile_data
    if request.method == 'POST':
        profile_data['name'] = request.form.get('name', profile_data['name'])
        profile_data['section'] = request.form.get('section', profile_data['section'])
        profile_data['interest'] = request.form.get('interest', profile_data['interest'])
        
        # Handle profile picture upload
        file = request.files.get('profile_pic')
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            profile_data['image'] = filename
            
        return redirect(url_for('profile'))
    return render_template('profile.html', profile=profile_data)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    global contact_data
    if request.method == 'POST':
        contact_data['email'] = request.form.get('email', contact_data['email'])
        contact_data['fbname'] = request.form.get('fbname', contact_data['fbname'])
        contact_data['number'] = request.form.get('number', contact_data['number'])
        contact_data['github'] = request.form.get('github', contact_data['github'])
        contact_data['note'] = request.form.get('note', contact_data['note'])
        return redirect(url_for('contact'))
    return render_template('contact.html', contact=contact_data)

@app.route('/works', methods=['GET', 'POST'])
def works():
    result = None
    shape = None
    if request.method == 'POST':
        shape = request.form.get('shape')
        try:
            if shape == 'circle':
                radius = float(request.form.get('radius', 0))
                result = math.pi * (radius ** 2)
            elif shape == 'triangle':
                base = float(request.form.get('base', 0))
                height = float(request.form.get('height', 0))
                result = 0.5 * base * height
        except ValueError:
            result = "Invalid input. Please enter valid numbers."
    return render_template('works.html', result=result, shape=shape)

@app.route('/linkedlist', methods=['GET', 'POST'])
def linkedlist_view():
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            val = request.form.get('value')
            if val:
                my_linked_list.append(val)
        elif action == 'remove_head':
            my_linked_list.remove_head()
        elif action == 'remove_tail':
            my_linked_list.remove_tail()
        elif action == 'clear':
            my_linked_list.clear()
        return redirect(url_for('linkedlist_view'))
    
    current_elements = my_linked_list.to_list()
    return render_template('linkedlist.html', elements=current_elements)

if __name__ == '__main__':
    app.run(debug=True)