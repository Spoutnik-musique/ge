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
    discordMessages.innerHTML = ''; // Efface les messages existants

    messages.forEach((msg, index) => {
        const messageElement = document.createElement('div');
        messageElement.className = 'discord-message';

        const avatarElement = document.createElement('img');
        avatarElement.src = msg.webhookAvatar;
        avatarElement.alt = msg.webhookName;
        avatarElement.className = 'discord-message-avatar'; // Classe pour styliser l'avatar

        const messageContent = document.createElement('div');
        messageContent.className = 'discord-message-content';

        const usernameElement = document.createElement('div');
        usernameElement.className = 'discord-message-username';
        usernameElement.textContent = msg.webhookName;

        const textElement = document.createElement('div');
        textElement.className = 'discord-message-text';
        textElement.contentEditable = true;
        textElement.textContent = msg.message;

        // Sauvegarder les modifications lorsque l'utilisateur quitte le champ d'édition
        textElement.addEventListener('blur', function() {
            messages[index].message = textElement.textContent;
            updateJSONEditor();  // Met à jour le JSON après modification
            saveToLocalStorage();  // Sauvegarde dans le localStorage après modification
        });

        // Ajout de la croix rouge pour la suppression
        const deleteButton = document.createElement('span');
        deleteButton.textContent = '❌';
        deleteButton.className = 'delete-button'; // Classe pour styliser la croix rouge
        deleteButton.addEventListener('click', function() {
            messages.splice(index, 1); // Supprimer le message du tableau
            updateDiscordMessages(); // Met à jour l'affichage des messages
            updateJSONEditor(); // Met à jour le JSON
            saveToLocalStorage(); // Sauvegarde les modifications
        });

        messageContent.appendChild(usernameElement);
        messageContent.appendChild(textElement);
        messageContent.appendChild(deleteButton); // Ajouter la croix rouge

        messageElement.appendChild(avatarElement);
        messageElement.appendChild(messageContent);

        discordMessages.appendChild(messageElement);
    });
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

// Fonction pour l'importation du JSON
function importJSON() {
    console.log('Import JSON function called');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        console.log('Selected file:', file);

        if (!file) {
            alert('Aucun fichier sélectionné.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            try {
                const importedMessages = JSON.parse(fileEvent.target.result);
                console.log('Imported JSON:', importedMessages);

                characters = [];
                messages = [];
                document.getElementById('characterList').innerHTML = '';

                importedMessages.forEach(msg => {
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
                saveToLocalStorage();
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
