let characters = [];
let messages = [];

document.getElementById('addCharacterBtn').addEventListener('click', openModal);
document.getElementById('saveCharacterBtn').addEventListener('click', saveCharacter);
document.getElementsByClassName('close')[0].addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
    if (event.target === document.getElementById('characterModal')) {
        closeModal();
    }
});

document.getElementById('exportJSONBtn').addEventListener('click', exportJSON);
document.getElementById('importJSONBtn').addEventListener('click', importJSON);

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
    }
}

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

    // Ajoute l'image et le texte au conteneur
    characterItem.appendChild(img);
    characterItem.appendChild(text);

    // Ajoute l'élément du personnage à la liste
    characterList.appendChild(characterItem);

    // Ajoute un événement de clic sur le bouton
    characterItem.addEventListener('click', function() {
        addCharacterToJSON(character);
    });
}

function addCharacterToJSON(character) {
    const message = {
        webhookName: character.name,
        webhookAvatar: character.avatar,
        message: "",
        time: 3
    };
    messages.push(message);
    updateJSONEditor();
}

function updateJSONEditor() {
    const processedMessages = messages.map(msg => {
        // Vérifie si le message contient 'delete' ou 'deleted' en tant que clé brute
        if (typeof msg === 'object') {
            const keys = Object.keys(msg);
            if (keys.includes('delete') || keys.includes('deleted')) {
                return { ...msg, delete: "YES" };
            }
        }
        return msg;
    });

    const jsonOutput = JSON.stringify(processedMessages, null, 2);
    document.getElementById('jsonEditor').value = jsonOutput;
}

function exportJSON() {
    const processedMessages = messages.map(msg => {
        // Convertit les valeurs 'delete' et 'deleted' non encadrées en une clé valide avant l'exportation
        if (typeof msg === 'object') {
            const keys = Object.keys(msg);
            if (keys.includes('delete') || keys.includes('deleted')) {
                return { ...msg, delete: "YES" };
            }
        }
        return msg;
    });

    const dataStr = JSON.stringify(processedMessages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scenario.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importJSON() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(fileEvent) {
            try {
                let importedMessages = JSON.parse(fileEvent.target.result);

                // Traite les messages importés pour ajouter "delete": "YES" si nécessaire
                importedMessages = importedMessages.map(msg => {
                    // Convertit les valeurs 'delete' et 'deleted' non encadrées en une clé valide
                    if (typeof msg === 'object') {
                        const keys = Object.keys(msg);
                        if (keys.includes('delete') || keys.includes('deleted')) {
                            return { ...msg, delete: "YES" };
                        }
                    }
                    return msg;
                });

                messages = importedMessages;
                updateJSONEditor();
                
                // Optionnel: Ajoutez les personnages importés à la liste
                characters = [];
                document.getElementById('characterList').innerHTML = '';
                importedMessages.forEach(msg => {
                    if (msg.webhookName && !characters.find(c => c.name === msg.webhookName)) {
                        characters.push({ name: msg.webhookName, avatar: msg.webhookAvatar });
                        addCharacterToList({ name: msg.webhookName, avatar: msg.webhookAvatar });
                    }
                });
            } catch (error) {
                alert('Erreur lors de l\'importation du fichier JSON');
            }
        };
        reader.readAsText(file);
    });
    
    fileInput.click();
}
