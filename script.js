const input = document.querySelector("[data-input]");
const btn = document.querySelector("[data-btn]");
const container = document.querySelector("[data-list-todos]");
const navContainer = document.querySelector("[data-todo-wrapper]");
const navigation = document.querySelectorAll(".navigation_list--link");
const todoTemplate = document.querySelector("[data-todo-template]");
const countAll = document.querySelector("[data-count-all]");
const countActive = document.querySelector("[data-count-active]");
const countCompleted = document.querySelector("[data-count-completed]");
const removeCompletedBtn = document.querySelector("[data-remove-completed]");
const selectAllBtn = document.querySelector("[data-select-all]");
const searchInput = document.querySelector("[data-search-input]");
const deadLineInput = document.querySelector("[data-date-input]");
const select = document.querySelector("[data-select]");

let todoList = JSON.parse(localStorage.getItem("todos")) || [];
let filterList = [];
let currentFilter = "all";

container.addEventListener("dblclick", (e) => {
    if(!e.target.classList.contains("todo-text")) return;

    const id = Number(e.target.closest("[data-id]").dataset.id);

    const input = document.createElement("input");
    input.value = e.target.textContent;

    e.target.replaceWith(input);
    input.focus();

    input.addEventListener("blur", (e) => {
        const todo = todoList.find(t => t.id === id);

        if(todo) {
            todo.text = input.value.trim() || todo.text;

            saveToLocalStorage(todoList);

            if (searchInput.value.trim()) {
                renderAndRenderFilteredTodos(searchInput.value.trim());
            } else {
                render();
            }

            updateCounters();
        }
    })

    input.addEventListener("keydown", (e) => {
        if(e.key === "Enter") {
            input.blur();
        }
    })
})

searchInput.addEventListener("input", (e) => {
    const searchValue = searchInput.value.trim();

    renderAndRenderFilteredTodos(searchValue);
})

function renderAndRenderFilteredTodos(searchValue) {
    filterList = todoList.filter(t => t.text.toLowerCase().includes(searchValue.toLowerCase()));

    renderFiltered();
}

selectAllBtn.addEventListener("click", (e) => {
    let check = todoList.some(t => !t.completed);

    if (check) {
        todoList = todoList.map(t => {
            return { ...t, completed: true }
        })
    } else {
        todoList = todoList.map(t => {
            return { ...t, completed: false }
        })
    }

    saveToLocalStorage(todoList);
    render();
    updateCounters();
})

navContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("navigation_list--link")) {
        navigation.forEach(btn => btn.classList.remove("active"))

        e.target.classList.add("active");

        currentFilter = e.target.dataset.filter;

        if (searchInput.value.trim()) {
            renderAndRenderFilteredTodos(searchInput.value.trim());
        } else {
            render();
        }
    }
})

removeCompletedBtn.addEventListener("click", (e) => {
    todoList = todoList.filter(t => !t.completed);

    saveToLocalStorage(todoList);
    render();
    updateCounters();
})

function saveToLocalStorage(list) {
    localStorage.setItem("todos", JSON.stringify(list))
}

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        btn.click();
    }
})

btn.addEventListener("click", () => {
    if (input.value.trim()) {
        const newTodo = {
            id: Date.now(),
            text: input.value,
            createdAt: createdDateRepresentation(new Date()),
            completed: false,
            deadLine: deadLineInput.value,
            difficult: select.value,
        }

        todoList.push(newTodo);
        input.value = "";

        saveToLocalStorage(todoList);
        render();
        updateCounters();
    }
})

function createdDateRepresentation(newCreatedDate) {
    return Intl.DateTimeFormat("uz-UZ", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
    }).format(newCreatedDate)
}

function createdTodoLoyaut(todo) {
    const todoElement = document.importNode(todoTemplate.content, true);

    const todoId = todoElement.querySelector(".todo");
    todoId.dataset.id = todo.id

    const checkbox = todoElement.querySelector("[data-todo-checkbox]");
    checkbox.checked = todo.completed;

    const todoText = todoElement.querySelector("[data-todo-text]");
    todoText.textContent = todo.text;

    const todoDate = todoElement.querySelector("[data-todo-date]");
    todoDate.textContent = todo.createdAt;

    const todoDeadLineDate = todoElement.querySelector("[data-todo-deadLine-date]");
    todoDeadLineDate.textContent = todo.deadLine;

    const todoSelect = todoElement.querySelector("[data-todo-difficulties]");
    todoSelect.textContent = todo.difficult

    const removeBtn = todoElement.querySelector("[data-remove-btn]");
    removeBtn.disabled = !todo.completed;

    checkbox.addEventListener("change", (e) => {
        todoList = todoList.map(t => {
            if (t.id === todo.id) {
                return { ...t, completed: e.target.checked }
            }
            return t
        })

        saveToLocalStorage(todoList);
        if (searchInput.value.trim()) {
            renderAndRenderFilteredTodos(searchInput.value.trim())
        } else {
            render();
        }
        updateCounters();
    })

    removeBtn.addEventListener("click", (e) => {
        todoList = todoList.filter(t => t.id !== todo.id);

        saveToLocalStorage(todoList);
        if (searchInput.value.trim()) {
            renderAndRenderFilteredTodos(searchInput.value.trim())
        } else {
            render();
        }
        updateCounters();
    })

    return todoElement;
}

function updateCounters() {
    const all = todoList.length;
    const active = todoList.filter(t => !t.completed).length;
    const completed = todoList.filter(t => t.completed).length;

    countAll.textContent = all;
    countActive.textContent = active;
    countCompleted.textContent = completed;
}

function renderFiltered() {
    container.innerHTML = "";

    let filteredTodos = filterList;

    if (filterList.length === 0) {
        return container.innerHTML = "<h3>No found todos...</h3>"
    }

    if (currentFilter === "active") {
        filteredTodos = filterList.filter(t => !t.completed)
    }

    if (currentFilter === "completed") {
        filteredTodos = filterList.filter(t => t.completed)
    }

    filteredTodos.forEach(todo => {
        const todoElement = createdTodoLoyaut(todo);

        container.append(todoElement);
    })
}

function render() {
    container.innerHTML = "";

    let filteredTodos = todoList;


    if (currentFilter === "active") {
        filteredTodos = todoList.filter(t => !t.completed)
    }

    if (currentFilter === "completed") {
        filteredTodos = todoList.filter(t => t.completed)
    }

    if (filteredTodos.length === 0) {
        return container.innerHTML = "<h3>No todos...</h3>"
    }

    const sortedTodos = [...filteredTodos].sort((a, b) => {
        const dateA = a.deadLine ? new Date(a.deadLine) : Infinity;
        const dateB = b.deadLine ? new Date(b.deadLine) : Infinity;

        return dateA - dateB;
    })

    sortedTodos.forEach(todo => {
        const todoElement = createdTodoLoyaut(todo);

        container.append(todoElement);
    })
}

render();
updateCounters();