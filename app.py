"""
Laboratory Exercise 4 - Tristen's Autumn Tower (Flask portfolio)
Run:  pip install -r requirements.txt   then   python app.py
Open: http://127.0.0.1:5000
"""
import json
import math
import uuid
from pathlib import Path

from flask import (Flask, abort, flash, redirect, render_template, request,
                   send_from_directory, session, url_for)
from werkzeug.utils import secure_filename

# --------------------------------------------------------------------------
# Setup
# --------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "profile.json"
PHOTO_DIR = BASE_DIR / "static" / "uploads" / "photos"
CODE_DIR = BASE_DIR / "static" / "uploads" / "code"
for folder in (DATA_FILE.parent, PHOTO_DIR, CODE_DIR):
    folder.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.secret_key = "autumn-tower-change-this-secret"
app.config["MAX_CONTENT_LENGTH"] = 8 * 1024 * 1024  # 8 MB per request

PHOTO_EXT = {"png", "jpg", "jpeg", "gif", "webp"}
CODE_EXT = {"py", "ipynb", "html", "css", "js", "java", "c", "cpp", "h", "cs",
            "json", "txt", "md", "sql", "php"}

CONTACT = {
    "name": "Tristen Marie G. Pastorite",
    "email": "pastoritetristen09@gmail.com",
    "facebook_name": "Tristen Pastorite",
    "facebook_url": "https://www.facebook.com/tristen.pastorite",
    "phone": "09948705281",
}

DEFAULT_PROFILE = {
    "name": "Tristen Marie G. Pastorite",
    "degree": "Bachelor of Science in Computer Engineering",
    "section": "2-1",
    "bio": "Second-year computer engineering student who loves building things "
           "with Python, hardware, and a little bit of magic.",
    "photo": None,
}


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def ext_of(filename):
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def load_profile():
    profile = dict(DEFAULT_PROFILE)
    if DATA_FILE.exists():
        try:
            profile.update(json.loads(DATA_FILE.read_text(encoding="utf-8")))
        except (OSError, ValueError):
            pass
    return profile


def save_profile(profile):
    DATA_FILE.write_text(json.dumps(profile, indent=2), encoding="utf-8")


def human_size(num_bytes):
    if num_bytes < 1024:
        return f"{num_bytes} B"
    if num_bytes < 1024 * 1024:
        return f"{num_bytes / 1024:.1f} KB"
    return f"{num_bytes / (1024 * 1024):.1f} MB"


def list_code_files():
    files = []
    for path in sorted(CODE_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if path.is_file():
            files.append({"name": path.name, "ext": ext_of(path.name),
                          "size": human_size(path.stat().st_size)})
    return files


def unique_name(folder, filename):
    """Avoid overwriting: notes.py -> notes_2.py"""
    stem, dot, ext = filename.rpartition(".")
    if not dot:
        stem, ext = filename, ""
    candidate, counter = filename, 2
    while (folder / candidate).exists():
        candidate = f"{stem}_{counter}.{ext}" if ext else f"{stem}_{counter}"
        counter += 1
    return candidate


def fmt(number):
    return f"{number:,.4f}".rstrip("0").rstrip(".")


# --------------------------------------------------------------------------
# Linked list (singly linked)
# Positions are 1-based in the UI: position 1 = head.
# --------------------------------------------------------------------------
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None

    def size(self):
        count, current = 0, self.head
        while current:
            count += 1
            current = current.next
        return count

    def add_head(self, data):
        node = Node(data)
        node.next = self.head
        self.head = node

    def add_tail(self, data):
        node = Node(data)
        if not self.head:
            self.head = node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = node

    def add_at(self, position, data):
        """Insert so the new node ends up at `position` (1 = head)."""
        if position < 1 or position > self.size() + 1:
            raise ValueError(f"Position must be between 1 and {self.size() + 1}.")
        if position == 1:
            self.add_head(data)
            return
        current = self.head
        for _ in range(position - 2):
            current = current.next
        node = Node(data)
        node.next = current.next
        current.next = node

    def remove_head(self):
        if not self.head:
            raise ValueError("The list is empty - there is no head to remove.")
        removed = self.head.data
        self.head = self.head.next
        return removed

    def remove_tail(self):
        if not self.head:
            raise ValueError("The list is empty - there is no tail to remove.")
        if not self.head.next:
            removed = self.head.data
            self.head = None
            return removed
        current = self.head
        while current.next.next:
            current = current.next
        removed = current.next.data
        current.next = None
        return removed

    def remove_at(self, position):
        size = self.size()
        if size == 0:
            raise ValueError("The list is empty - nothing to remove.")
        if position < 1 or position > size:
            raise ValueError(f"Position must be between 1 and {size}.")
        if position == 1:
            return self.remove_head()
        current = self.head
        for _ in range(position - 2):
            current = current.next
        removed = current.next.data
        current.next = current.next.next
        return removed

    def clear(self):
        self.head = None

    def to_list(self):
        items, current = [], self.head
        while current:
            items.append(current.data)
            current = current.next
        return items


my_linked_list = LinkedList()
for starter in ("Pumpkin", "Acorn", "Maple leaf"):
    my_linked_list.add_tail(starter)


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
@app.route("/")
def index():
    return render_template("index.html", profile=load_profile())


@app.route("/profile")
def profile():
    return render_template("profile.html", profile=load_profile(),
                           code_files=list_code_files(),
                           photo_exts=sorted(PHOTO_EXT), code_exts=sorted(CODE_EXT))


@app.post("/profile/update")
def profile_update():
    data = load_profile()
    for field, limit in (("name", 80), ("degree", 120), ("section", 20), ("bio", 400)):
        value = request.form.get(field, "").strip()
        if value:
            data[field] = value[:limit]
    save_profile(data)
    flash("Profile saved.", "ok")
    return redirect(url_for("profile"))


@app.post("/profile/photo")
def profile_photo():
    file = request.files.get("photo")
    if not file or not file.filename:
        flash("Choose a picture first.", "error")
        return redirect(url_for("profile"))
    ext = ext_of(file.filename)
    if ext not in PHOTO_EXT:
        flash("Pictures must be " + ", ".join(sorted(PHOTO_EXT)) + ".", "error")
        return redirect(url_for("profile"))
    data = load_profile()
    new_name = f"{uuid.uuid4().hex[:12]}.{ext}"
    file.save(PHOTO_DIR / new_name)
    old = data.get("photo")
    if old and (PHOTO_DIR / old).is_file():
        (PHOTO_DIR / old).unlink()
    data["photo"] = new_name
    save_profile(data)
    flash("Profile picture updated.", "ok")
    return redirect(url_for("profile"))


@app.post("/profile/photo/remove")
def profile_photo_remove():
    data = load_profile()
    old = data.get("photo")
    if old and (PHOTO_DIR / old).is_file():
        (PHOTO_DIR / old).unlink()
    data["photo"] = None
    save_profile(data)
    flash("Picture removed. Your chibi is back.", "ok")
    return redirect(url_for("profile"))


@app.post("/profile/code")
def profile_code_upload():
    uploaded, rejected = 0, []
    for file in request.files.getlist("code"):
        if not file or not file.filename:
            continue
        name = secure_filename(file.filename)
        if not name or ext_of(name) not in CODE_EXT:
            rejected.append(file.filename)
            continue
        file.save(CODE_DIR / unique_name(CODE_DIR, name))
        uploaded += 1
    if uploaded:
        flash(f"Uploaded {uploaded} file{'s' if uploaded != 1 else ''}.", "ok")
    if rejected:
        flash("Skipped (unsupported type): " + ", ".join(rejected), "error")
    if not uploaded and not rejected:
        flash("Choose at least one file.", "error")
    return redirect(url_for("profile"))


def safe_code_path(filename):
    name = secure_filename(filename)
    path = CODE_DIR / name
    if not name or not path.is_file():
        abort(404)
    return name, path


@app.route("/profile/code/<filename>")
def code_view(filename):
    name, path = safe_code_path(filename)
    text = path.read_text(encoding="utf-8", errors="replace")
    return render_template("code_view.html", name=name, code=text,
                           lines=text.count("\n") + 1)


@app.route("/profile/code/<filename>/download")
def code_download(filename):
    name, _ = safe_code_path(filename)
    return send_from_directory(CODE_DIR, name, as_attachment=True)


@app.post("/profile/code/<filename>/delete")
def code_delete(filename):
    name, path = safe_code_path(filename)
    path.unlink()
    flash(f"Deleted {name}.", "ok")
    return redirect(url_for("profile"))


@app.errorhandler(413)
def too_large(_error):
    flash("That upload is too big (8 MB max).", "error")
    return redirect(url_for("profile"))


@app.route("/contact")
def contact():
    return render_template("contact.html", contact=CONTACT)


# ----- Work: string tool + area of circle + area of triangle ---------------
def transform_text(text, mode):
    if mode == "upper":
        return text.upper()
    if mode == "lower":
        return text.lower()
    if mode == "title":
        return text.title()
    if mode == "sentence":
        return ". ".join(part.strip().capitalize() for part in text.split(".") if part.strip()) \
            + ("." if text.strip().endswith(".") else "")
    raise ValueError("Unknown option.")


def to_number(raw, label):
    try:
        value = float(raw)
    except (TypeError, ValueError):
        raise ValueError(f"{label} must be a number.")
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"{label} must be zero or more.")
    return value


@app.route("/work", methods=["GET", "POST"])
def work():
    tool = request.values.get("tool", "upper")
    if tool not in ("upper", "circle", "triangle"):
        tool = "upper"
    result, error = None, None

    if request.method == "POST":
        try:
            if tool == "upper":
                text = request.form.get("text", "")
                mode = request.form.get("mode", "upper")
                if not text.strip():
                    raise ValueError("Type something to transform first.")
                result = {"kind": "text", "value": transform_text(text, mode),
                          "note": f"{len(text)} characters"}
            elif tool == "circle":
                radius = to_number(request.form.get("radius"), "Radius")
                result = {"kind": "math", "value": fmt(math.pi * radius ** 2),
                          "unit": "square units",
                          "steps": f"A = \u03c0 \u00d7 r\u00b2 = \u03c0 \u00d7 {fmt(radius)}\u00b2",
                          "extra": f"Circumference: {fmt(2 * math.pi * radius)} units"}
            else:
                base = to_number(request.form.get("base"), "Base")
                height = to_number(request.form.get("height"), "Height")
                result = {"kind": "math", "value": fmt(0.5 * base * height),
                          "unit": "square units",
                          "steps": f"A = \u00bd \u00d7 b \u00d7 h = \u00bd \u00d7 {fmt(base)} \u00d7 {fmt(height)}",
                          "extra": None}
        except ValueError as exc:
            error = str(exc)

    return render_template("work.html", tool=tool, result=result, error=error,
                           form=request.form if request.method == "POST" else {})


# ----- Linked list ---------------------------------------------------------
@app.route("/linkedlist", methods=["GET", "POST"])
def linkedlist_view():
    if request.method == "POST":
        action = request.form.get("action", "")
        value = request.form.get("value", "").strip()
        position_raw = request.form.get("position", "").strip()
        try:
            if action in ("add_head", "add_tail", "add_at"):
                if not value:
                    raise ValueError("Type a value for the new node.")
                if action == "add_head":
                    position = 1
                elif action == "add_tail":
                    position = my_linked_list.size() + 1
                else:
                    if not position_raw.lstrip("-").isdigit():
                        raise ValueError("Enter a whole-number position, or click a + in the list.")
                    position = int(position_raw)
                my_linked_list.add_at(position, value)
                items = my_linked_list.to_list()
                before = items[position - 2] if position > 1 else None
                after = items[position] if position < len(items) else None
                if before and after:
                    where = f'between "{before}" and "{after}"'
                elif after:
                    where = f'as the new head, before "{after}"'
                elif before:
                    where = f'as the new tail, after "{before}"'
                else:
                    where = "as the first node"
                flash(f'Inserted "{value}" at position {position}, {where}.', "ok")
                session["ll_new"] = position
            elif action == "remove_head":
                flash(f'Removed "{my_linked_list.remove_head()}" from the head.', "ok")
            elif action == "remove_tail":
                flash(f'Removed "{my_linked_list.remove_tail()}" from the tail.', "ok")
            elif action == "remove_at":
                if not position_raw.lstrip("-").isdigit():
                    raise ValueError("Enter a whole-number position.")
                position = int(position_raw)
                flash(f'Removed "{my_linked_list.remove_at(position)}" from position {position}.', "ok")
            elif action == "clear":
                my_linked_list.clear()
                flash("The list is now empty.", "ok")
        except ValueError as exc:
            flash(str(exc), "error")
        return redirect(url_for("linkedlist_view"))

    items = my_linked_list.to_list()
    new_pos = session.pop("ll_new", None)
    return render_template("linkedlist.html", elements=items, size=len(items), new_pos=new_pos)


@app.route("/fun")
def fun():
    return render_template("fun.html")


if __name__ == "__main__":
    app.run(debug=True)
