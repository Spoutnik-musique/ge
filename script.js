let characters = [];
let messages = [];
let scenarios = [];
let scenarioJSONs = {};

// Initialisation lors du chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
});

// Événements pour les boutons
document.getElementById('addCharacterBtn').addEventListener('click', openModal);
document.getElementById('saveCharacterBtn').addEventListener('click', saveCharacter);
document.getElementsByClassName('close')[0].addEventListener('click', closeModal);
document.getElementById('createScenarioBtn').addEventListener('click', openCreateScenarioModal);
document.getElementById('startScenarioBtn').addEventListener('click', startNewScenario);
document.getElementById('viewScenariosBtn').addEventListener('click', openScenariosModal);
document.getElementById('importJSONBtn').addEventListener('click', importJSON);
document.getElementById('exportJSONBtn').addEventListener('click', exportJSON);
document.getElementById('importTupperJSONBtn').addEventListener('click', importJSON);


window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('characterModal')) {
        closeModal();
    }
    if (event.target === document.getElementById('CreateModal')) {
        closeCreateScenarioModal();
    }
    if (event.target === document.getElementById('scenariosModal')) {
        closeScenariosModal();
    }
});

function openModal() {
    document.getElementById('characterModal').style.display = "block";
}

function closeModal() {
    document.getElementById('characterModal').style.display = "none";
}

function openCreateScenarioModal() {
    document.getElementById('CreateModal').style.display = "block";
}

function closeCreateScenarioModal() {
    document.getElementById('CreateModal').style.display = "none";
}

function openScenariosModal() {
    document.getElementById('scenariosModal').style.display = "block";
    updateScenariosList();
}

function closeScenariosModal() {
    document.getElementById('scenariosModal').style.display = "none";
}
function startNewScenario() {
    const scenarioName = document.getElementById('scénario').value;

    if (scenarioName) {
        // Enregistre le scénario actuel si des messages sont présents
        if (messages.length > 0) {
            scenarioJSONs[scenarioName] = JSON.stringify(messages, null, 2);
            scenarios.push(scenarioName);
            saveToLocalStorage();
        }

        // Réinitialise les personnages et messages pour le nouveau scénario
        characters = [];
        messages = [];
        document.getElementById('characterList').innerHTML = '';
        updateJSONEditor();

        // Ferme le modal et met à jour la liste des scénarios
        closeCreateScenarioModal();
        updateScenariosList();
    } else {
        alert('Veuillez entrer un nom pour le scénario.');
    }
}

function saveCharacter() {
    const name = document.getElementById('characterName').value;
    const avatar = document.getElementById('characterAvatar').value;

    if (name && avatar) {
        const character = { name, avatar };

        if (!characters.find(c => c.name === character.name)) {
            characters.push(character);
            addCharacterToList(character);
            closeModal();
            updateJSONEditor();
            saveToLocalStorage();
        } else {
            alert('Le personnage existe déjà.');
        }
    }
}
function updateScenariosList() {
    const scenariosList = document.getElementById('scenariosList');
    scenariosList.innerHTML = '';

    scenarios.forEach(scenario => {
        const scenarioButton = document.createElement('button');
        scenarioButton.textContent = scenario;
        scenarioButton.addEventListener('click', function() {
            loadScenario(scenario);
            closeScenariosModal();
        });
        scenariosList.appendChild(scenarioButton);
    });
}

// Fonction pour ajouter un personnage à la liste des personnages
function addCharacterToList(character) {
    const characterList = document.getElementById('characterList');

    // Crée un conteneur pour chaque personnage
    const characterItem = document.createElement('div');
    characterItem.className = 'character-item';

    // Crée l'image circulaire pour la PDP
    const img = document.createElement('img');
    img.src = character.avatar;
    img.alt = character.name;
    img.className = 'avatar'; // Ajout de la classe pour le style

    // Crée le texte du personnage
    const text = document.createElement('span');
    text.textContent = character.name;

    // Ajoute la croix rouge pour la suppression
    const deleteButton = document.createElement('span');
    deleteButton.textContent = '❌';
    deleteButton.className = 'delete-button'; // Classe pour styliser la croix rouge
    deleteButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Empêche la propagation du clic pour éviter d'ajouter le personnage
        const index = characters.indexOf(character);
        if (index > -1) {
            characters.splice(index, 1); // Supprime le personnage du tableau
            updateCharacterList(); // Met à jour l'affichage des personnages
            updateJSONEditor(); // Met à jour le JSON
            saveToLocalStorage(); // Sauvegarde les modifications
        }
    });

    // Ajoute l'image, le texte et la croix rouge au conteneur
    characterItem.appendChild(img);
    characterItem.appendChild(text);
    characterItem.appendChild(deleteButton);

    // Ajoute l'élément du personnage à la liste
    characterList.appendChild(characterItem);

    // Ajoute un événement de clic sur le bouton
    characterItem.addEventListener('click', function() {
        addCharacterToJSON(character);
    });
}

// Fonction pour ajouter un personnage au JSON
function addCharacterToJSON(character) {
    const newMessage = {
        webhookName: character.name,
        webhookAvatar: character.avatar,
        message: "",
        time: 3
    };

    messages.push(newMessage);

    updateDiscordMessages();
    updateJSONEditor();
    saveToLocalStorage();
}

// Fonction pour mettre à jour la liste des personnages
function updateCharacterList() {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = ''; // Efface les éléments existants

    characters.forEach(character => addCharacterToList(character));
}



function updateDiscordMessages() {
    const discordMessages = document.getElementById('discordMessages');
    discordMessages.innerHTML = ''; // Clear existing messages

    messages.forEach((msg, index) => {
        // Main message container
        const messageElement = document.createElement('div');
        messageElement.className = 'discord-message';
        messageElement.setAttribute('draggable', true);
        messageElement.setAttribute('data-index', index);

        // Avatar
        const avatarElement = document.createElement('img');
        avatarElement.src = msg.webhookAvatar;
        avatarElement.alt = msg.webhookName;
        avatarElement.className = 'discord-message-avatar';

        // Content container (for username, message text, and time input)
        const messageContent = document.createElement('div');
        messageContent.className = 'discord-message-content';

        // Container for username and message input
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';

        // Username
        const usernameElement = document.createElement('div');
        usernameElement.className = 'discord-message-username';
        usernameElement.textContent = msg.webhookName;

        // Editable message text
        const textElement = document.createElement('div');
        textElement.className = 'discord-message-text';
        textElement.contentEditable = true;
        textElement.textContent = msg.message;

        textElement.addEventListener('blur', function() {
            messages[index].message = textElement.textContent;
            updateJSONEditor();
            saveToLocalStorage();
        });

        // Append username and message text to textContainer
        textContainer.appendChild(usernameElement);
        textContainer.appendChild(textElement);

        // Time input field
        const timeInput = document.createElement('input');
        timeInput.type = 'number';
        timeInput.className = 'time-input';
        timeInput.value = msg.time || 0;
        timeInput.addEventListener('input', function() {
            messages[index].time = parseInt(timeInput.value) || 0;
            updateJSONEditor();
            saveToLocalStorage();
        });

        // Delete button
        const deleteButton = document.createElement('span');
        deleteButton.textContent = '❌';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', function() {
            messages.splice(index, 1); // Remove the message from the array
            updateDiscordMessages(); // Update the displayed messages
            updateJSONEditor();       // Update the JSON
            saveToLocalStorage();     // Save changes to localStorage
        });

        // Arrange elements
        messageContent.appendChild(textContainer); // Add text container to content
        messageContent.appendChild(timeInput);     // Add time input to the right
        messageContent.appendChild(deleteButton);  // Add delete button to the far right
        messageElement.appendChild(avatarElement); // Avatar on the left
        messageElement.appendChild(messageContent); // Content to the right of avatar

        discordMessages.appendChild(messageElement); // Add to the main container
    });
}



// Ajout de l'événement de recherche de personnage
document.getElementById('searchCharacter').addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();  // Récupère le texte de la barre de recherche
    updateCharacterList(searchTerm);  // Appelle la fonction de mise à jour avec le terme de recherche
});

// Modification de la fonction updateCharacterList pour filtrer les personnages
function updateCharacterList(searchTerm = '') {
    const characterList = document.getElementById('characterList');
    characterList.innerHTML = ''; // Efface les personnages actuels

    // Filtrer les personnages en fonction du terme de recherche
    const filteredCharacters = characters.filter(character => 
        character.name.toLowerCase().includes(searchTerm)
    );

    // Afficher uniquement les personnages filtrés
    filteredCharacters.forEach(character => addCharacterToList(character));
}

function updateJSONEditor() {
    const jsonOutput = JSON.stringify(messages, null, 2);
    document.getElementById('jsonEditor').value = jsonOutput;
}


// Fonction pour l'exportation du JSON
async function exportJSON() {
    console.log('Export JSON function called');

    const jsonOutput = JSON.stringify(messages, null, 2);

    // Vérifier la disponibilité de l'API showSaveFilePicker
    if (!window.showSaveFilePicker) {
        alert('L\'API showSaveFilePicker n\'est pas supportée par ce navigateur.');
        return;
    }

    try {
        const options = {
            types: [{
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
            }],
            suggestedName: 'messages.json'
        };

        const handle = await window.showSaveFilePicker(options);
        const writable = await handle.createWritable();
        await writable.write(jsonOutput);
        await writable.close();
        
        alert('Fichier JSON exporté avec succès !');
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Enregistrement annulé par l\'utilisateur.');
        } else {
            console.error('Erreur lors de l\'exportation du fichier JSON:', error);
            alert('Une erreur est survenue lors de l\'exportation.');
        }
    }
}

// Modify the importJSON function to handle different JSON types
function importJSON() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) {
            alert('Aucun fichier sélectionné.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            try {
                const jsonData = JSON.parse(fileEvent.target.result);

                // Check for Tupperbox data structure
                if (jsonData.tuppers && Array.isArray(jsonData.tuppers)) {
                    importTupperJSON(jsonData);  // Use new Tupper-specific import
                } else {
                    // Fallback to the original import function if not Tupper format
                    originalImportJSON(jsonData);
                }
            } catch (error) {
                alert('Erreur lors de l\'importation du fichier JSON');
                console.error('Error parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    });

    fileInput.click();
}

function startNewScenario() {
    const scenarioName = document.getElementById('scénario').value;
    if (scenarioName) {
        // Enregistre le scénario actuel
        if (messages.length > 0) {
            scenarioJSONs[scenarioName] = JSON.stringify(messages, null, 2);
            scenarios.push(scenarioName);
            saveToLocalStorage();
        }

        // Réinitialise les personnages et messages pour le nouveau scénario
        characters = [];
        messages = [];
        document.getElementById('characterList').innerHTML = '';
        updateJSONEditor();

        // Ferme le modal et met à jour la liste des scénarios
        closeCreateScenarioModal();
        updateScenariosList();
    }
}

function updateScenariosList() {
    const scenariosList = document.getElementById('scenariosList');
    scenariosList.innerHTML = '';

    scenarios.forEach(scenario => {
        const scenarioButton = document.createElement('button');
        scenarioButton.textContent = scenario;
        scenarioButton.addEventListener('click', function() {
            loadScenario(scenario);
            closeScenariosModal();
        });
        scenariosList.appendChild(scenarioButton);
    });
}

function loadScenario(scenarioName) {
    console.log('Loading scenario:', scenarioName);

    try {
        const scenarioJSON = scenarioJSONs[scenarioName];
        if (!scenarioJSON) {
            throw new Error('Scenario not found.');
        }

        // Efface les données existantes
        characters = [];
        messages = [];
        document.getElementById('characterList').innerHTML = '';

        // Charge les nouvelles données
        const loadedMessages = JSON.parse(scenarioJSON);

        loadedMessages.forEach(msg => {
            if (!characters.find(c => c.name === msg.webhookName)) {
                const character = { name: msg.webhookName, avatar: msg.webhookAvatar };
                characters.push(character);
                addCharacterToList(character);
            }

            messages.push({
                webhookName: msg.webhookName,
                webhookAvatar: msg.webhookAvatar,
                message: msg.message || "",
                time: msg.time || 3
            });
        });

        updateDiscordMessages();
        updateJSONEditor();
    } catch (error) {
        alert('Erreur lors du chargement du scénario');
        console.error('Error loading scenario:', error);
    }
}


function saveToLocalStorage() {
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
    localStorage.setItem('scenarioJSONs', JSON.stringify(scenarioJSONs));
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('messages', JSON.stringify(messages));
    console.log('Données sauvegardées dans le localStorage');
}


// Fonction pour charger depuis le localStorage
function loadFromLocalStorage() {
    const loadedScenarios = JSON.parse(localStorage.getItem('scenarios') || '[]');
    const loadedScenarioJSONs = JSON.parse(localStorage.getItem('scenarioJSONs') || '{}');
    const loadedCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    const loadedMessages = JSON.parse(localStorage.getItem('messages') || '[]');

    scenarios = loadedScenarios;
    scenarioJSONs = loadedScenarioJSONs;
    characters = loadedCharacters;
    messages = loadedMessages;

    updateJSONEditor();
    characters.forEach(character => addCharacterToList(character));
    updateScenariosList();
    updateDiscordMessages();  // Appel de la mise à jour des messages ici
}

// Événements pour les boutons
document.getElementById('addCharacterBtn').addEventListener('click', openModal);
document.getElementById('saveCharacterBtn').addEventListener('click', saveCharacter);
document.getElementsByClassName('close')[0].addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('characterModal')) {
        closeModal();
    }
});

function openModal() {
    document.getElementById('characterModal').style.display = "block";
}

function closeModal() {
    document.getElementById('characterModal').style.display = "none";
}

function saveCharacter() {
    const name = document.getElementById('characterName').value;
    const avatar = document.getElementById('characterAvatar').value;

    if (name && avatar) {
        const character = { name, avatar };
        characters.push(character);
        addCharacterToList(character);
        closeModal();
    } else {
        alert('Veuillez entrer un nom et un avatar pour le personnage.');
    }
}
// Variables globales pour gérer le drag-and-drop
let draggedElement = null;
let dropIndicator = document.getElementById('dropIndicator');

// Fonction pour gérer le dragstart
function handleDragStart(event) {
    draggedElement = event.target;
    draggedElement.classList.add('dragging');
    setTimeout(() => {
        draggedElement.classList.add('hidden');
    }, 0);
}

// Fonction pour gérer le dragend
function handleDragEnd(event) {
    draggedElement.classList.remove('dragging', 'hidden');
    draggedElement = null;
    dropIndicator.classList.add('hidden');
}

// Fonction pour gérer le dragover
function handleDragOver(event) {
    event.preventDefault();

    const messagesContainer = document.getElementById('discordMessages');
    const children = Array.from(messagesContainer.children);
    const afterElement = getDragAfterElement(messagesContainer, event.clientY);

    if (afterElement) {
        messagesContainer.insertBefore(dropIndicator, afterElement);
    } else {
        messagesContainer.appendChild(dropIndicator);
    }

    dropIndicator.classList.remove('hidden');
}

// Fonction pour gérer le drop
function handleDrop(event) {
    event.preventDefault();

    const messagesContainer = document.getElementById('discordMessages');
    const afterElement = getDragAfterElement(messagesContainer, event.clientY);

    messagesContainer.insertBefore(draggedElement, dropIndicator);

    // Mise à jour de l'ordre des messages dans le tableau
    const draggedIndex = messages.indexOf(messages.find(msg => msg.message === draggedElement.querySelector('.discord-message-text').textContent));
    const newIndex = afterElement ? messages.indexOf(messages.find(msg => msg.message === afterElement.querySelector('.discord-message-text').textContent)) : messages.length;

    const [movedMessage] = messages.splice(draggedIndex, 1);
    messages.splice(newIndex, 0, movedMessage);

    updateJSONEditor();
    saveToLocalStorage();

    dropIndicator.classList.add('hidden');
}

// Fonction pour obtenir l'élément après lequel on doit insérer
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.discord-message:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Appliquer les événements sur chaque message
function addDragAndDropListeners() {
    const messages = document.querySelectorAll('.discord-message');
    messages.forEach(message => {
        message.setAttribute('draggable', true);
        message.addEventListener('dragstart', handleDragStart);
        message.addEventListener('dragend', handleDragEnd);
        message.addEventListener('dragover', handleDragOver);
        message.addEventListener('drop', handleDrop);
    });
}
// Function to import Tupperbox JSON data specifically
function importTupperJSON(tupperData) {
    try {
        const parsedData = tupperData.tuppers; // Access the "tuppers" array

        parsedData.forEach(tupper => {
            const character = {
                name: tupper.name,
                avatar: tupper.avatar_url
            };

            // Avoid duplicate names
            if (!characters.find(c => c.name === character.name)) {
                characters.push(character);
                addCharacterToList(character);
            }
        });

        updateJSONEditor();
        saveToLocalStorage();
        alert('Importation de Tupperbox réussie!');
    } catch (error) {
        console.error('Erreur lors de l\'importation de Tupperbox:', error);
        alert('Le format JSON est incorrect ou l\'importation a échoué.');
    }
}
