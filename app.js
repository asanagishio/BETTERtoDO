const listsContainer = document.querySelector("[data-lists]");
const newListForm = document.querySelector("[data-new-list-form]");
const newListInput = document.querySelector("[data-new-list-input]");
const deleteListButton = document.querySelector("[data-delete-list-button]");
const listDisplayContainer = document.querySelector(
  "[data-list-display-container]"
);
const listTitleElement = document.querySelector("[data-list-title]");
const listCountElement = document.querySelector("[data-list-count]");
const tasksContainer = document.querySelector("[data-tasks]");
const taskTemplate = document.getElementById("task-template");
const newTaskForm = document.querySelector("[data-new-task-form]");
const newTaskInput = document.querySelector("[data-new-task-input]");
const clearCompleteTasksButton = document.querySelector(
  "[data-clear-complete-tasks-button]"
);
//localStorage.clear();
// prevent overwriting localStorage key 'xxx.yyy'
const LOCAL_STORAGE_LIST_KEY = "task.lists";
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = "task.selectedListId";
// getItem from localStorage (if exist) or be a empty array
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
// it would return null if nothing is selected
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

// fired up event when clicked anything from listsContainer
listsContainer.addEventListener("click", (e) => {
  // if the click event is caused by element li
  if (e.target.tagName.toLowerCase() === "li") {
    selectedListId = e.target.dataset.listId;
    saveAndRender();
  }
});

tasksContainer.addEventListener("click", (e) => {
  if (e.target.tagName.toLowerCase() === "input") {
    const selectedList = lists.find((list) => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(
      (task) => task.id === e.target.id
    );
    selectedTask.complete = e.target.checked;
    save();
    renderTaskCount(selectedList);
  }
  if (e.target.tagName.toLowerCase() === "button") {
    const deleteTaskId = e.target.parentNode.querySelector("input").id;
    // console.log(deleteTaskId);
    //e.target.parentNode.remove();
    const selectedList = lists.find((list) => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(
      (task) => task.id !== deleteTaskId
    );
    // console.log(selectedList);
    saveAndRender();
    renderTaskCount(selectedList);
  }
});

newListForm.addEventListener("submit", (e) => {
  // prevent submitting form and cause page refresh
  e.preventDefault();
  const listName = newListInput.value;
  // break if invalid input
  if (listName == null || listName === "") return;
  const list = createList(listName);
  // clear the input value
  newListInput.value = null;
  // add list to lists
  lists.push(list);
  saveAndRender();
});

newTaskForm.addEventListener("submit", (e) => {
  // prevent submitting form and cause page refresh
  e.preventDefault();
  const taskName = newTaskInput.value;
  // break if invalid input
  if (taskName == null || taskName === "") return;
  const task = createTask(taskName);
  // clear the input value
  newTaskInput.value = null;
  // add list to lists
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks.push(task);
  saveAndRender();
});

clearCompleteTasksButton.addEventListener("click", (e) => {
  const selectedList = lists.find((list) => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter((task) => !task.complete);
  saveAndRender();
});

deleteListButton.addEventListener("click", () => {
  // filter out the selected list --> only the non-selected list left
  lists = lists.filter((list) => list.id !== selectedListId);
  // reset the selected list id because we no longer have selected list
  selectedListId = null;
  saveAndRender();
});

function createList(name) {
  // Date.now().toString() using current time to create unique id
  return { id: Date.now().toString(), name: name, tasks: [] };
  /** that's how the tasks should look at:
   * tasks: [{id: 1, name: 'someName', complete: true/false}, ...]
   */
}

function saveAndRender() {
  save();
  render();
}

// save to localStorage
function save() {
  // setItem(key: string, value: string)
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function render() {
  // clear and re-render the listsContainer (data-lists)
  clearElement(listsContainer);
  renderLists();
  // find the list that it's id is equal to selectedListId
  const selectedList = lists.find((list) => list.id === selectedListId);
  // listDisplayContainer disappear if nothing (no list) is selected
  if (!selectedList) {
    listDisplayContainer.style.display = "none";
  } else {
    listDisplayContainer.style.display = "";
    // set the list title
    listTitleElement.innerText = selectedList.name;
    renderTaskCount(selectedList);
    clearElement(tasksContainer);
    renderTasks(selectedList);
  }
}

function renderLists() {
  lists.forEach((list) => {
    // create li element inside data-lists
    const listElement = document.createElement("li");
    // adding data-list-id attribute to li (<li data-list-id>)
    listElement.dataset.listId = list.id;
    // adding class="list-name" to li (<li class="list-name" data-list-id>)
    listElement.classList.add("list-name");
    // <li class="list-name" data-list-id>list.name</li>
    listElement.innerText = list.name;
    // if the list is currently selected, add it to active-list
    if (list.id === selectedListId) listElement.classList.add("active-list");
    listsContainer.appendChild(listElement);
  });
}

function renderTaskCount(selectedList) {
  // return the count of incomplete tasks
  const incompleteTasksCount = selectedList.tasks.filter(
    (task) => !task.complete
  ).length;
  // plurel checking
  const taskString = incompleteTasksCount === 1 ? "task" : "tasks";
  // rewrite the remaining counter
  listCountElement.innerText = `${incompleteTasksCount} ${taskString} remaining`;
}

function renderTasks(selectedList) {
  selectedList.tasks.forEach((task) => {
    // true for get everything from taskTemplate element --> whole task-template element
    const taskElement = document.importNode(taskTemplate.content, true);
    const checkbox = taskElement.querySelector("input");
    // set the attributes;
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    const label = taskElement.querySelector("label");
    // set the attributes;
    label.htmlFor = task.id;
    label.append(task.name);
    const deleteTaskButton = taskElement.querySelector("button");
    tasksContainer.appendChild(taskElement);
  });
}

function createTask(name) {
  return { id: Date.now().toString(), name: name, complete: false };
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

render();
