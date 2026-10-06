from flask import Flask, render_template, request, redirect, url_for
import math

app = Flask(__name__)

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

    def to_list(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements

my_linked_list = LinkedList()
my_linked_list.append("Apple")
my_linked_list.append("Banana")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/calculator', methods=['GET', 'POST'])
def calculator():
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
    return render_template('calculator.html', result=result, shape=shape)

@app.route('/linkedlist', methods=['GET', 'POST'])
def linkedlist_view():
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'add':
            val = request.form.get('value')
            if val:
                my_linked_list.append(val)
        elif action == 'clear':
            my_linked_list.head = None
        return redirect(url_for('linkedlist_view'))
    
    current_elements = my_linked_list.to_list()
    return render_template('linkedlist.html', elements=current_elements)

if __name__ == '__main__':
    app.run(debug=True)