// Constants
const elements = {
	main: document.getElementById('main'),
	taskInput: document.getElementById('taskInput'),
	addNewTaskBtn: document.getElementById('addTaskBtn'),
	tasksList: document.getElementById('tasksList'),
	clearTasksBtn: document.getElementById('clearTasksBtn'),
	counter: document.getElementById('counter'),
	tasksContainer: document.getElementById('tasksContainer'),
};

const settings = {
	maxInputLength: 100,
	taskLimit: 200,
	taskStorageId: 'task',
};

const classes = {
	clearBtnStart: 'opacity-0 scale-95 pointer-events-none',
	clearBtnActive: 'mt-6 md:mt-8 p-2 cursor-pointer active:scale-95 opacity-100 scale-100 pointer-events-auto',
	createAnimation: 'transform scale-y-0 opacity-0 origin-top transition-all duration-500 ease-out',
	showTextStart: 'invisible pointer-events-none',
	showTextActive: 'visible pointer-events-auto',
	liStartingHeight: 'h-10 md:h-12',
};

const newLiContent = () => {
	const content = `
		<div class="text-item flex justify-between items-center gap-2 w-full">
			<div class="status-task flex items-center justify-start gap-2 md:gap-4 flex-1 min-w-0 hover:scale-102 origin-center transition-all duration-200">
				<svg class="icon-task flex-none size-5 md:size-6 text-accent cursor-pointer" data-action="toggle-complete">
					<use href="./src/svg/icons.svg#circle"></use>
				</svg>
				<p class="text-task flex-1 line-clamp-1 cursor-pointer break-all whitespace-normal" data-action="toggle-complete"></p>
			</div>
			<div class="btns flex flex-row flex-none items-center justify-center gap-2">
				<button type="button" class="show-text invisible pointer-events-none" aria-label="Show full task text" data-action="handle-show-text" aria-expanded="false">
					<svg class="size-5 md:size-6 text-text-color cursor-pointer hover:text-caret-hover hover:scale-105 transition-all duration-200" aria-hidden="true">
						<use href="./src/svg/icons.svg#caret-down"></use>
					</svg>
				</button>
				<button type="button" class="modify" aria-label="Modify task" data-action="modify-task">
					<svg class="size-5 md:size-6 text-accent cursor-pointer hover:text-accent-hover hover:scale-105 transition-all duration-200" aria-hidden="true">
						<use href="./src/svg/icons.svg#modify"></use>
					</svg>
				</button>
				<button type="button" class="trash-can overflow-hidden" aria-label="Delete task" data-action="delete-task">
					<svg class="size-5 md:size-6 text-cancel cursor-pointer hover:text-cancel-hover hover:scale-105 transition-all duration-200" aria-hidden="true">
						<use href="./src/svg/icons.svg#trash-can"></use>
					</svg>
				</button>
			</div>
		</div>
	`;
	return content;
};

const newLiElement = () => {
	const li = document.createElement('li');
	li.className = "w-full py-2 last:mb-4 border-b-2 border-border grid place-items-center " + classes.createAnimation;
	li.ariaLabel = "Task item";
	li.insertAdjacentHTML('afterbegin', newLiContent());
	return li;
};

const editTaskContent = () => {
	const container = document.createElement('div');
	container.className = 'edit-item flex justify-between items-center gap-2 w-full';
	const content = `
		<div class="edit flex-1 flex flex-row items-center justify-start gap-2">
			<label for="editInput" class="sr-only">Edit task (max 100 characters)</label>
			<input type="text" id="editInput" valuee="" maxlength="${settings.maxInputLength}" class="edit flex-1 focus:outline-none box-border border-2 rounded-lg border-transparent" autocomplete="off" oninput="editCounter.value = 100 - this.value.length" />
			<div class="counter size-8 bg-counter text-white text-xs md:text-sm rounded-md grid place-items-center"><output id="editCounter" aria-live="polite" aria-atomic="true"></output></div>
		</div>
		<div class="control flex-none flex flex-row items-center justify-center gap-2">
			<button type="button" class="accept" aria-label="Accept modification" data-action="accept-modification">
				<svg class="size-4 md:size-6 text-check cursor-pointer hover:text-check-hover hover:scale-105 transition-all duration-200" aria-hidden="true">
					<use href="./src/svg/icons.svg#accept"></use>
				</svg>
			</button>
			<button type="button" class="cancel overflow-hidden" aria-label="Cancel modification" data-action="cancel-modification">
				<svg class="size-4 md:size-6 text-cancel cursor-pointer hover:text-cancel-hover hover:scale-105 transition-all duration-200" aria-hidden="true">
					<use href="./src/svg/icons.svg#cancel"></use>
				</svg>
			</button>
		</div>
	`;
	container.insertAdjacentHTML('afterbegin', content);
	return container;
}

// Helper functions
function firstCharToUpperCase(str) {
	if (str.length === 0) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function sanitizeInput(input) {
	let newInput = firstCharToUpperCase(input.trim());
	return String(newInput || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function checkEmptyInput(input) {
	const str = String(input.value || '');
	const isEmpty = sanitizeInput(str).length === 0;
	if (isEmpty) {
		input.classList.toggle('border-transparent');
		input.classList.toggle('border-cancel');
		setTimeout(() => {
			input.classList.toggle('border-transparent');
			input.classList.toggle('border-cancel');
		}, 1000);
		input.focus();
	}
	return isEmpty;
}

function checkTaskLimit() {
	const taskCount = elements.tasksList.children.length;
	if (taskCount >= settings.taskLimit) {
		elements.taskInput.disabled = true;
		elements.addNewTaskBtn.disabled = true;
		elements.taskInput.classList.add('pointer-events-none');
		elements.addNewTaskBtn.classList.add('pointer-events-none');
		elements.taskInput.setAttribute('aria-disabled', 'true');
		elements.addNewTaskBtn.setAttribute('aria-disabled', 'true');
		elements.addNewTaskBtn.classList.replace('bg-accent', 'bg-start');
		elements.taskInput.placeholder = `Task limit reached (${settings.taskLimit})`;
	} else {
		if (!elements.taskInput.classList.contains('pointer-events-none') && !elements.addNewTaskBtn.classList.contains('pointer-events-none')) return;
		elements.taskInput.disabled = false;
		elements.addNewTaskBtn.disabled = false;
		elements.taskInput.classList.remove('pointer-events-none');
		elements.addNewTaskBtn.classList.remove('pointer-events-none');
		elements.taskInput.setAttribute('aria-disabled', 'false');
		elements.addNewTaskBtn.setAttribute('aria-disabled', 'false');
		elements.addNewTaskBtn.classList.replace('bg-start', 'bg-accent');
		elements.taskInput.placeholder = 'Add a new task';
	}
}

function createDate() {
	const date = new Date().toLocaleString();
	return date;
}

function createStorageId() {
	const id = Date.now().toString(36);
	return id;
}

function resetInputHandler() {
	elements.taskInput.value = '';
	elements.taskInput.focus();
	elements.counter.value = settings.maxInputLength;
	elements.tasksList.scrollTo({ top: elements.tasksList.scrollHeight, behavior: 'smooth' });
}

function clampedText(taskText) {
	const showTextBtn = taskText.closest('li').querySelector('.show-text');
	if (taskText.scrollHeight > taskText.clientHeight) {
		if (showTextBtn.classList.contains(...classes.showTextActive.split(' '))) return;
		showTextBtn.classList.remove(...classes.showTextStart.split(' '));
		showTextBtn.classList.add(...classes.showTextActive.split(' '));
		taskText.classList.add('text-sm', 'md:text-base');
	} else {
		if (showTextBtn.classList.contains(...classes.showTextStart.split(' '))) return;
		showTextBtn.classList.remove(...classes.showTextActive.split(' '));
		showTextBtn.classList.add(...classes.showTextStart.split(' '));
		taskText.classList.remove('text-sm', 'md:text-base');
	}
}

function checkTextClamping() {
	const tasksText = elements.tasksList.querySelectorAll('.text-task');
	tasksText.forEach(taskText => {
		clampedText(taskText);
	});
}

function emptyListHandler() {
	if (elements.tasksList.children.length > 0) {
		const placeholder = document.getElementById('emptyPlaceholder');
		if (!placeholder) return;
		elements.tasksList.removeChild(placeholder);
	} else {
		const placeholder = document.createElement('p');
		placeholder.id = 'emptyPlaceholder';
		placeholder.setAttribute('aria-live', 'polite');
		placeholder.className = 'w-full text-center text-text-color text-base md:text-lg italic mt-4';
		placeholder.textContent = 'No tasks available. Add a new task to get started!';
		if (elements.clearTasksBtn.classList.contains(...classes.clearBtnActive.split(' '))) {
			setTimeout(() => {
				elements.tasksList.appendChild(placeholder);
			}, 500);
		} else {
			elements.tasksList.appendChild(placeholder);
		}
	}
}

function enterKeydownHandler(input) {
	if (input.id === 'taskInput') {
		elements.addNewTaskBtn.click();
	} else if (input.id === 'editInput') {
		const taskItem = input.closest('li');
		if (!taskItem) return;
		acceptTaskModification(taskItem);
	}
}

function escapeKeydownHandler(input) {
	if (input.id === 'taskInput') {
		input.value = '';
		elements.counter.value = settings.maxInputLength;
		input.focus();
	} else if (input.id === 'editInput') {
		const taskItem = input.closest('li');
		if (!taskItem) return;
		cancelTaskModification(taskItem);
	}
}

// Main Height Adjustment
function measureMainHeight() {
	const prev = elements.main.style.height;
	elements.main.style.height = 'auto';
	const height = elements.main.scrollHeight;
	elements.main.style.height = prev;
	return height;
}

const ro = new ResizeObserver(() => {
	const newHeight = measureMainHeight();
	if (elements.main.offsetHeight !== newHeight) {
		elements.main.style.height = newHeight + 'px';
	}
});

// Local Storage functions
function getTaskFromLocalStorage() {
	return JSON.parse(localStorage.getItem(settings.taskStorageId)) || [];
}

function storeTaskToLocalStorage(data) {
	const tasks = getTaskFromLocalStorage();
	tasks.push(data);
	localStorage.setItem(settings.taskStorageId, JSON.stringify(tasks));
}

function updateLocalStorageTask(task) {
	const tasks = getTaskFromLocalStorage();
	const taskIndex = tasks.findIndex(t => t.id === task.dataset.id);
	if (taskIndex === -1) return;
	const newText = task.querySelector('.text-task').textContent;
	const updatedTask = {
		text: sanitizeInput(newText),
		completed: task.dataset.complete,
		updated: createDate(),
	};
	tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
	localStorage.setItem(settings.taskStorageId, JSON.stringify(tasks));
}

function createTaskElement(task) {
	const taskEl = newLiElement();
	taskEl.dataset.date = task.date;
	taskEl.dataset.complete = task.completed;
	taskEl.dataset.type = task.type;
	taskEl.dataset.id = task.id;
	taskEl.role = "listitem";
	taskEl.ariaLabel = "Task item";
	taskEl.classList.remove('scale-y-0', 'opacity-0');
	const taskText = taskEl.querySelector('.text-task');
	taskText.textContent = sanitizeInput(task.text);
	if (task.completed === 'true') {
		const taskIconUse = taskEl.querySelector('.icon-task use');
		taskIconUse.setAttribute('href', './src/svg/icons.svg#check');
		taskText.classList.add('line-through', 'opacity-50');
	}
	return taskEl;
}

function removeTaskFromLocalStorage(task) {
	const tasks = getTaskFromLocalStorage();
	const filteredTasks = tasks.filter(t => t.id !== task.dataset.id);
	localStorage.setItem(settings.taskStorageId, JSON.stringify(filteredTasks));
}

function loadTasksFromStorage() {
	const tasks = getTaskFromLocalStorage();
	if (tasks.length === 0) return;
	const fragment = document.createDocumentFragment();
	tasks.forEach(task => {
		const loadedTask = createTaskElement(task);
		fragment.appendChild(loadedTask);
	});
	elements.tasksList.appendChild(fragment);
	requestAnimationFrame(checkTextClamping);
	clearAllTasksBtn();
}


// Functions
function modifyTaskItem(taskItem) {
	const currentTextValue = taskItem.querySelector('.text-task').textContent;
	const taskContainer = taskItem.querySelector('.text-item');
	if (!taskContainer) return;
	const editContainer = editTaskContent();
	taskContainer.classList.add('hidden');
	taskItem.appendChild(editContainer);
	const editInput = editContainer.querySelector('#editInput');
	const editCounter = editContainer.querySelector('#editCounter');
	editInput.value = currentTextValue;
	editCounter.value = settings.maxInputLength - editInput.value.length;
	editInput.focus();
}

function acceptTaskModification(taskItem) {
	const editContainer = taskItem.querySelector('.edit-item');
	const originalTaskText = taskItem.querySelector('.text-task');
	const editInput = editContainer.querySelector('#editInput');
	if (!editContainer || !originalTaskText || !editInput) return;
	const newText = sanitizeInput(editInput.value);
	if (checkEmptyInput(editInput)) return;
	const textChanged = newText !== originalTaskText.textContent;
	const taskContainer = taskItem.querySelector('.text-item');
	taskContainer.classList.remove('hidden');
	taskItem.removeChild(editContainer);
	if (textChanged) {
		originalTaskText.textContent = newText;
		clampedText(originalTaskText);
		toggleTaskCompletion(taskItem);
	}
}

function cancelTaskModification(taskItem) {
	const editContainer = taskItem.querySelector('.edit-item');
	const taskContainer = taskItem.querySelector('.text-item');
	if (!editContainer || !taskContainer) return;
	taskContainer.classList.remove('hidden');
	taskItem.removeChild(editContainer);
}

function toggleTaskCompletion(taskItem) {
	const taskText = taskItem.querySelector('.text-task');
	const taskIconUse = taskItem.querySelector('.icon-task use');
	if (!taskText && !taskIconUse) return;
	const presentStatus = taskItem.dataset.complete === 'true';
	if (presentStatus) {
		taskIconUse.setAttribute('href', './src/svg/icons.svg#circle');
		taskText.classList.remove('line-through', 'opacity-50');
		taskItem.dataset.complete = 'false';
	} else {
		taskIconUse.setAttribute('href', './src/svg/icons.svg#check');
		taskText.classList.add('line-through', 'opacity-50');
		taskItem.dataset.complete = 'true';
	}
	updateLocalStorageTask(taskItem);
}

function deleteTaskItem(taskItem) {
	tasksList.removeChild(taskItem);
	removeTaskFromLocalStorage(taskItem);
	checkTaskLimit();
	emptyListHandler();
	clearAllTasksBtn();
}

function handleShowTaskText(taskItem) {
	const taskText = taskItem.querySelector('.text-task');
	const showTextBtn = taskItem.querySelector('.show-text');
	if (!taskText || !showTextBtn) return;
	const isCollapsed = taskText.classList.contains('line-clamp-1');
	showTextBtn.setAttribute('aria-expanded', isCollapsed);
	const startHeight = taskItem.offsetHeight;
	taskText.classList.toggle('line-clamp-1');
	const endHeight = taskItem.scrollHeight;
	taskItem.style.height = `${startHeight}px`;
	requestAnimationFrame(() => {
		taskItem.style.height = `${endHeight}px`;
	});
	taskItem.addEventListener(
		'transitionend',
		() => (taskItem.style.height = ''),
		{ once: true }
	);
	const showTextIconUse = showTextBtn.querySelector('use');
	showTextIconUse.setAttribute('href', isCollapsed ? './src/svg/icons.svg#caret-up' : './src/svg/icons.svg#caret-down');
}

function handleTaskItemClick(e) {
	const clickedElement = e.target.closest('[data-action]');
	if (!clickedElement) return;
	const action = clickedElement.dataset.action;
	const taskItem = clickedElement.closest('li');
	if (!taskItem) return;
	switch (action) {
		case 'toggle-complete':
			toggleTaskCompletion(taskItem);
			break;
		case 'modify-task':
			modifyTaskItem(taskItem);
			break;
		case 'delete-task':
			deleteTaskItem(taskItem);
			break;
		case 'handle-show-text':
			handleShowTaskText(taskItem);
			break;
		case 'accept-modification':
			acceptTaskModification(taskItem);
			break;
		case 'cancel-modification':
			cancelTaskModification(taskItem);
			break;
		default:
			break;
	}
	elements.taskInput.focus();
}

function clearTasksList() {
	localStorage.setItem(settings.taskStorageId, JSON.stringify([]));
	elements.tasksList.innerHTML = '';
	checkTaskLimit();
	emptyListHandler();
	clearAllTasksBtn();
}

function clearAllTasksBtn() {
	const toActive = elements.tasksList.children.length > 1;
	if (toActive) {
		if (elements.clearTasksBtn.classList.contains(...classes.clearBtnActive.split(' '))) return;
		setTimeout(() => {
			elements.clearTasksBtn.classList.remove(...classes.clearBtnStart.split(' '));
			elements.clearTasksBtn.classList.add(...classes.clearBtnActive.split(' '));
		}, 300);
	} else {
		if (elements.clearTasksBtn.classList.contains(...classes.clearBtnStart.split(' '))) return;
		setTimeout(() => {
			elements.clearTasksBtn.classList.remove(...classes.clearBtnActive.split(' '));
			elements.clearTasksBtn.classList.add(...classes.clearBtnStart.split(' '));
		}, 300);
	}
}

function addNewTask() {
	const data = {
		text: sanitizeInput(elements.taskInput.value),
		date: createDate(),
		completed: 'false',
		type: 'task',
		id: createStorageId(),
	};
	const newTask = newLiElement();
	newTask.dataset.date = data.date;
	newTask.dataset.complete = data.completed;
	newTask.dataset.type = data.type;
	newTask.dataset.id = data.id;
	const taskText = newTask.querySelector('.text-task');
	taskText.textContent = data.text;
	const taskIcon = newTask.querySelector('.icon-task use');
	elements.tasksList.appendChild(newTask);
	setTimeout(() => {
		newTask.classList.remove('scale-y-0', 'opacity-0');
	}, 100);
	clampedText(taskText);
	storeTaskToLocalStorage(data);
	resetInputHandler();
	checkTaskLimit();
	emptyListHandler();
	clearAllTasksBtn();
}

// Initialize App
function initializeApp() {
	elements.main.style.height = measureMainHeight() + 'px';
	elements.taskInput.maxLength = settings.maxInputLength;
	elements.counter.value = settings.maxInputLength;
	elements.taskInput.focus();
	loadTasksFromStorage();
	ro.observe(elements.tasksContainer);
	emptyListHandler();
	checkTaskLimit();
}
initializeApp();

// Events handler
elements.addNewTaskBtn.addEventListener('click', () => {
	if (checkEmptyInput(elements.taskInput)) return;
	addNewTask();
});

elements.tasksList.addEventListener('click', (e) => {
	handleTaskItemClick(e);
});

elements.clearTasksBtn.addEventListener('click', () => {
	clearTasksList();
});

document.addEventListener('keydown', (e) => {
	const key = e.key;
	const activeInput = e.target;
	if ((key !== 'Enter' && key !== 'Escape') || !activeInput) return;
	switch (key) {
		case 'Enter':
			enterKeydownHandler(activeInput);
			break;
		case 'Escape':
			escapeKeydownHandler(activeInput);
			break;
		default:
			break;
	}
});