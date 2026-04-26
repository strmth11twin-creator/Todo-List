const input = document.querySelector("[data-input]");
const btn = document.querySelector("[data-btn]");
const container = document.querySelector("[data-list-todos]");
const navContainer = document.querySelector("[data-todo-wrapper]");
const navigation = document.querySelectorAll(".navigation_list--link");
const todoTemplate = document.querySelector("[data-todo-template]");
const countAll = document.querySelector("[data-count-all]");
const countActive = document.querySelector("[data-count-active]");
const countCompleted = document.querySelector("[data-count-completed]");

let todoList = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";

navContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("navigation_list--link")) {
        navigation.forEach(btn => btn.classList.remove("active"))

        e.target.classList.add("active");

        currentFilter = e.target.dataset.filter;

        render();
    }
})

function saveToLocalStorage(list) {
    localStorage.setItem("todos", JSON.stringify(list))
}

input.addEventListener("keydown", (e) => {
    if(e.key === "Enter") {
        btn.click();
    }
})

btn.addEventListener("click", () => {
    if(input.value.trim()) {
        const newTodo = {
            id: Date.now(),
            text: input.value,
            completed: false,
        }
        todoList.push(newTodo);
        input.value = "";

        saveToLocalStorage(todoList);
        render();
        updateCounters();
    }
})

function createdTodoLoyaut(todo) {
    const todoElement = document.importNode(todoTemplate.content, true);

    const checkbox = todoElement.querySelector("[data-todo-checkbox]");
    checkbox.checked = todo.completed;

    const todoText = todoElement.querySelector("[data-todo-text]");
    todoText.textContent = todo.text;

    const removeBtn = todoElement.querySelector("[data-remove-btn]");
    removeBtn.disabled = !todo.completed;

    checkbox.addEventListener("change", (e) => {
        todoList = todoList.map(t => {
            if(t.id === todo.id) {
               return {...t, completed: e.target.checked}
            }
            return t
        })
        saveToLocalStorage(todoList);
        render();
        updateCounters();
    })

    removeBtn.addEventListener("click", (e) => {
        todoList = todoList.filter(t => t.id !== todo.id);
        saveToLocalStorage(todoList);
        render();
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

function render() {
    container.innerHTML = "";

    let filteredTodos = todoList;

    if(currentFilter === "active") {
        filteredTodos = todoList.filter(t => !t.completed)
    }

    if(currentFilter === "completed") {
        filteredTodos = todoList.filter(t => t.completed)
    }
    
    if(filteredTodos.length === 0) {
        return container.innerHTML = "<h3>no todos...</h3>"
    }

    filteredTodos.forEach(todo => {
        const todoElement = createdTodoLoyaut(todo);

        container.append(todoElement);
    })
}

render();
updateCounters();