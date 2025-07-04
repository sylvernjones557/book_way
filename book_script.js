let bookisedited = null;

class Book {
  constructor(book_name, author_name, isbn_number) {
    this.book_name = book_name;
    this.author_name = author_name;
    this.isbn_number = isbn_number;
  }
}

class UI {
  add_book(book) {
    const table = document.querySelector(".table_body");
    const tr = document.createElement("tr");
    tr.className = "new_entry";
    tr.innerHTML = `
      <td class="text-center">
        <div class="d-flex align-items-center justify-content-center">${book.book_name}</div>
      </td>
      <td class="text-center">
        <div class="d-flex align-items-center justify-content-center">${book.author_name}</div>
      </td>
      <td class="text-center">
        <div class="d-flex align-items-center justify-content-center">${book.isbn_number}</div>
      </td>
      <td class="text-center">
        <div class="d-flex align-items-center justify-content-center">
          <i class="fa fa-pen text-primary me-2 edit-btn" style="cursor:pointer;"></i>
          <i class="fa fa-remove text-danger delete-btn" style="cursor:pointer;"></i>
        </div>
      </td>
    `;
    table.appendChild(tr);
  }

  clear_fields() {
    document.querySelector("#book_name").value = "";
    document.querySelector("#author_name").value = "";
    document.querySelector("#isbn_number").value = "";
  }

  show_alert(msg, type) {
    const alertBox = document.querySelector(".alert-box");
    alertBox.innerHTML = `
      <div class="alert alert-${type}" role="alert">${msg}</div>
    `;
    setTimeout(() => {
      alertBox.innerHTML = "";
    }, 3000);
  }
}

class Storage {
  get_books() {
    let books;
    if (localStorage.getItem("BOOKS") === null) books = [];
    else books = JSON.parse(localStorage.getItem("BOOKS"));
    return books;
  }

  add_books(book) {
    const local = this.get_books();
    local.push(book);
    localStorage.setItem("BOOKS", JSON.stringify(local));
  }

  removeSingle(value) {
    const local = this.get_books();
    for (let i = 0; i < local.length; i++) {
      if (local[i].isbn_number === value) {
        local.splice(i, 1);
        break;
      }
    }
    localStorage.setItem("BOOKS", JSON.stringify(local));
  }

  load_Books() {
    const loaded = this.get_books();
    const ui = new UI();
    for (let i = 0; i < loaded.length; i++) {
      ui.add_book(loaded[i]);
    }
  }
}

const store = new Storage();
document.addEventListener("DOMContentLoaded", () => store.load_Books());

document.querySelector("#book_form").addEventListener("submit", function (e) {
  e.preventDefault();

  const book_name = document.querySelector("#book_name").value.trim();
  const author_name = document.querySelector("#author_name").value.trim();
  const isbn_number = document.querySelector("#isbn_number").value.trim();

  const ui = new UI();
  const store = new Storage();
  const all_books = store.get_books();

  // Empty fields
  if (book_name === "" || author_name === "" || isbn_number === "") {
    ui.show_alert("❌ Enter all fields properly.", "danger");
    return;
  }

  // Edit mode
  if (bookisedited !== null) {
    for (let i = 0; i < all_books.length; i++) {
      if (all_books[i].isbn_number === bookisedited) {
        all_books[i].book_name = book_name;
        all_books[i].author_name = author_name;
        break;
      }
    }

    localStorage.setItem("BOOKS", JSON.stringify(all_books));
    document.querySelector(".table_body").innerHTML = "";
    store.load_Books();
    ui.clear_fields();
    document.querySelector("#isbn_number").disabled = false;
    bookisedited = null;
    ui.show_alert("✅ Book updated successfully!", "success");
    return;
  }

  // Add mode with unique ISBN check
  for (let i = 0; i < all_books.length; i++) {
    if (all_books[i].isbn_number === isbn_number) {
      ui.show_alert("⚠️ This book already exists!", "warning");
      ui.clear_fields();
      return;
    }
  }

  const newBook = new Book(book_name, author_name, isbn_number);
  ui.add_book(newBook);
  store.add_books(newBook);
  ui.clear_fields();
  ui.show_alert("✅ New book added!", "success");
});

// 📘 Handle edit and delete
document.querySelector(".table_body").addEventListener("click", function (e) {
  const store = new Storage();
  const ui = new UI();

  if (e.target.classList.contains("fa-remove")) {
    const row = e.target.closest("tr");
    const isbn = row.children[2].textContent.trim();
    store.removeSingle(isbn);
    row.remove();
    ui.show_alert("🗑️ Book removed!", "warning");
  }

  if (e.target.classList.contains("fa-pen")) {
    const row = e.target.closest("tr");
    const name = row.children[0].textContent.trim();
    const author = row.children[1].textContent.trim();
    const isbn_number = row.children[2].textContent.trim();

    document.querySelector("#book_name").value = name;
    document.querySelector("#author_name").value = author;
    document.querySelector("#isbn_number").value = isbn_number;
    document.querySelector("#isbn_number").disabled = true;

    bookisedited = isbn_number;

    ui.show_alert("✏️ Edit mode: Update the fields and submit.", "info");
  }
});
