const taskBtn = document.getElementById('addTaskBtn');
const taskInput = document.getElementById('taskInput');
const tasksList = document.getElementById('tasksList');

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.length > 0) {
        let tasksArray = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key.startsWith('task-')) continue;
            tasksArray.push({
                id: key.slice(5),
                data: JSON.parse(localStorage.getItem(key))
            });
        }
        tasksArray.sort((a, b) => Number(a.id) - Number(b.id));
        tasksArray.forEach(task => {
            tasksList.insertAdjacentHTML('beforeend', createTaskElement(task.data.text, task.data.status, task.id));
        });
        clearButton();
    }
});

function sanitizeInput(input) {
    return String(input || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function saveTask(task, id, status) {
    const idPrefix = String(id).startsWith("task-") ? '' : 'task-';
    id = String(idPrefix + id);
    localStorage.setItem(id, JSON.stringify({ text: task, status: status }));
}

function updateTaskStatus(id, status = '', text = '') {
    id = "task-" + String(id);
    const task = JSON.parse(localStorage.getItem(id));
    task.status = status !== '' ? status : task.status;
    task.text = text !== '' ? text : task.text;
    localStorage.setItem(id, JSON.stringify(task));
}

function toggleTaskStatus(li) {
    console.log(li);
    const icon = li.querySelector('.icon-task use');
    const text = li.querySelector('.text-task');
    text.classList.toggle('line-through');
    text.classList.toggle('opacity-50');
    if (text.classList.contains('line-through')) {
        li.setAttribute('data-status', 'true');
        updateTaskStatus(li.getAttribute('data-id'), 'true', '');
        if (icon) icon.setAttribute('href', './src/svg/icons.svg#check');
    } else {
        li.setAttribute('data-status', 'false');
        updateTaskStatus(li.getAttribute('data-id'), 'false', '');
        if (icon) icon.setAttribute('href', './src/svg/icons.svg#circle');
    }
}

function acceptModification(li) {
    const inputField = li.querySelector('.edit');
    const acceptBtn = li.querySelector('.accept');
    const text = li.querySelector('.text-task');
    const liDivs = li.children;
    let newText = inputField.value.trim();
    if (newText === '') {
        inputField.classList.toggle('border-transparent');
        inputField.classList.toggle('border-red-600');
        setTimeout(() => {
            inputField.classList.toggle('border-transparent');
            inputField.classList.toggle('border-red-600');
        }, 2000);
    } else {
        newText = sanitizeInput(newText);
        newText = newText.charAt(0).toUpperCase() + newText.slice(1);
        text.textContent = newText;
        liDivs[0].classList.remove('hidden');
        liDivs[1].classList.remove('hidden');
        inputField.remove();
        acceptBtn.remove();
        updateTaskStatus(li.getAttribute('data-id'), '', newText);
    }
}

function modifyTaskText(li) {
    const liDivs = li.children;
    const text = li.querySelector('.text-task');
    liDivs[0].classList.add('hidden');
    liDivs[1].classList.add('hidden');
    const editInput = `
            <label for="editInput" class="sr-only">Edit task</label>
            <input type="text" maxlength="100" class="edit w-full md:basis-3/4 p-2 md:mr-4 focus:outline-none text-zinc-700 box-border border-2 rounded-lg border-transparent"
            value="${sanitizeInput(text.textContent.trim())}" autocomplete="off" />
            <button type="button" class="accept" aria-label="Accept modification">
                <svg class="size-4 md:size-6 text-emerald-700 cursor-pointer">
                    <use href="./src/svg/icons.svg#accept"></use>
                </svg>
            </button>
        `;
    if (li.querySelector('.edit') === null) li.insertAdjacentHTML('beforeend', editInput);
    li.querySelector('.edit').focus();
}

function removeTask(li) {
    const id = "task-" + li.getAttribute('data-id');
    localStorage.removeItem(id);
    li.remove();
    clearButton();
}

function taskStatus(e) {
    const li = e.target.closest('li');
    const click = e.target.closest('.trash-can, .icon-task, .text-task, .modify, .accept');
    if (!click || !li) return;
    if (click.classList.contains('icon-task') || click.classList.contains('text-task')) {
        toggleTaskStatus(li);
    } else if (click.classList.contains('modify')) {
        modifyTaskText(li);
    } else if (click.classList.contains('trash-can')) {
        removeTask(li);
    } else if (click.classList.contains('accept')) {
        acceptModification(li);
    }
}

function clearButton() {
    if (tasksList.children.length > 1 && !document.getElementById('clearTasksBtn')) {
        const clearBtn = `
        <button type="button" id="clearTasksBtn" aria-label="Clear all tasks" class="w-full p-2 text-lg md:text-2xl bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer box-border border-2 border-transparent active:border-red-800 active:scale-95 transition-transform duration-150 mt-4">
            Clear All Tasks
        </button>
        `;
        tasksList.insertAdjacentHTML('afterend', clearBtn);
    } else if (tasksList.children.length <= 1 && document.getElementById('clearTasksBtn')) {
        document.getElementById('clearTasksBtn').remove();
    }
}

function createTaskElement(taskText, status = false, id = null) {
    const statusTask = status ? status : 'false';
    const idTask = id ? sanitizeInput(String(id)) : String(Date.now());
    let sanitizedText = sanitizeInput(taskText);
    sanitizedText = sanitizedText.charAt(0).toUpperCase() + sanitizedText.slice(1);
    const li = `
    <li class="flex justify-between items-center max-w-full last:mb-4 max-h-4 md:max-h-6" role="listitem" aria-label="Task: ${sanitizedText}" data-id="${idTask}" data-status="${statusTask}">
        <div class="flex items-center gap-2 md:gap-4 ">
            <svg class="icon-task size-4 md:size-6 text-sky-500 cursor-pointer">
                <use href="./src/svg/icons.svg#${statusTask === 'true' ? 'check' : 'circle'}"></use>
            </svg>
            <p class="text-task ${statusTask === 'true' ? 'line-through opacity-50' : ''} cursor-pointer max-w-2xs md:max-w-lg wrap-break-word whitespace-normal overflow-x-hidden">${sanitizedText}</p>
        </div>
        <div class="flex flex-row items-center justify-center gap-2">
            <button type="button" class="modify" aria-label="Modify task">
                <svg class="modify size-4 md:size-6 text-sky-500 cursor-pointer">
                    <use href="./src/svg/icons.svg#modify"></use>
                </svg>
            </button>
            <button type="button" class="trash-can" aria-label="Delete task">
                <svg class="trash-can size-4 md:size-6 text-red-600 cursor-pointer">
                    <use href="./src/svg/icons.svg#trash-can"></use>
                </svg>
            </button>
        </div>
    </li>
    `;
    if (localStorage.getItem(String('task-' + idTask)) === null) saveTask(sanitizedText, idTask, statusTask);
    return li;
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
        taskInput.classList.toggle('border-transparent');
        taskInput.classList.toggle('border-red-600');
        setTimeout(() => {
            taskInput.classList.toggle('border-transparent');
            taskInput.classList.toggle('border-red-600');
        }, 2000);
    } else {
        tasksList.insertAdjacentHTML('beforeend', createTaskElement(taskText));
        taskInput.value = '';
        clearButton();
    }
}

function clearAllTasks() {
    const tasks = document.querySelectorAll('#tasksList li');
    tasks.forEach(task => {
        localStorage.removeItem('task-' + task.dataset.id);
        task.remove();
    });
    clearButton();
}

taskBtn.addEventListener('click', addTask);
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const inputFocused = e.target;
    if (inputFocused === taskInput) {
        addTask();
    } else if (inputFocused.classList.contains('edit')) {
        const li = inputFocused.closest('li');
        console.log(li);
        acceptModification(li);
    }
});
tasksList.addEventListener('click', (e) => {
    taskStatus(e);
});
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'clearTasksBtn') {
        clearAllTasks();
    }
});