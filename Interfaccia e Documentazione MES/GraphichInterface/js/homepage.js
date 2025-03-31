// js/homepage.js

// --- Elementi DOM ---
const canvasContainer = document.getElementById('canvas-container');
const loadingIndicator = document.getElementById('loading-indicator');
const roomDetailsDiv = document.getElementById('room-details');
const roomNameTitle = document.getElementById('room-name-title');
const floorplanImage = document.getElementById('floorplan-image');
const deviceListDiv = document.getElementById('device-list');
const closeDetailsButton = document.getElementById('close-details');

// NUOVI Elementi DOM per il Modal
const showAllDevicesBtn = document.getElementById('show-all-devices-btn');
const modalOverlay = document.getElementById('modal-overlay');
const allDevicesModal = document.getElementById('all-devices-modal');
const closeModalBtn = allDevicesModal.querySelector('.close-modal-btn');
const modalDeviceListDiv = document.getElementById('modal-device-list');

// --- Variabili Three.js (scope del modulo) ---
let scene, camera, renderer, controls;
let raycaster, mouse;
const clickableObjects = []; // Array per memorizzare le mesh delle stanze cliccabili
let currentlyHovered = null; // Traccia oggetto sotto il mouse per hover
let selectedObject = null;   // Traccia oggetto attualmente selezionato

// --- Inizializzazione ---
function init3D() {
    // Scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    // Camera
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(10, 10, 15);
    camera.lookAt(scene.position);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    // Luci
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Leggermente più intensa
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9); // Leggermente più intensa
    directionalLight.position.set(15, 20, 10);
    directionalLight.castShadow = true; // Opzionale: Abilita ombre
    scene.add(directionalLight);
     // Opzionale: Configurazione ombre (può impattare performance)
     renderer.shadowMap.enabled = true;
     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
     directionalLight.shadow.mapSize.width = 1024;
     directionalLight.shadow.mapSize.height = 1024;

    // Controlli Orbitali
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
/*
    // --- CARICAMENTO MODELLO 3D con GLTFLoader ---
    const loader = new GLTFLoader();
    loadingIndicator.style.display = 'block'; // Mostra indicatore
    loadingIndicator.textContent = 'Caricamento modello 3D...';
    canvasContainer.classList.add('loading-model'); // Classe per gestire stile durante caricamento

    loader.load(
        'model/modern_house.glb', // <-- SOSTITUISCI CON IL TUO PERCORSO REALE!
        function (gltf) {
            // Modello caricato con successo
            const model = gltf.scene;
            scene.add(model);
            loadingIndicator.style.display = 'none'; // Nascondi indicatore
            canvasContainer.classList.remove('loading-model');

            // Abilita ombre per gli oggetti nel modello (opzionale)
             model.traverse(function (node) {
                 if (node.isMesh) {
                     node.castShadow = true;
                     node.receiveShadow = true;
                 }
             });

            // Cerca le mesh delle stanze nel modello e aggiungile a clickableObjects
            model.traverse((child) => {
                // Verifica se è una Mesh e se il suo NOME corrisponde a una chiave in houseData
                if (child.isMesh && houseData[child.name]) {
                    clickableObjects.push(child);
                    console.log(`Trovata mesh cliccabile: ${child.name}`);
                    // Assicurati che il materiale sia standard per hover/selezione (potrebbe servire adattare)
                    if (!(child.material instanceof THREE.MeshStandardMaterial) && !(child.material instanceof THREE.MeshPhysicalMaterial)) {
                         console.warn(`Materiale di ${child.name} non è Standard/Physical, effetti hover/select potrebbero non funzionare come previsto.`);
                         // Potresti voler assegnare un nuovo materiale standard qui se necessario
                    }
                    // Opzionale: Rendi i materiali leggermente trasparenti per vedere dentro?
                    // child.material.transparent = true;
                    // child.material.opacity = 0.9;
                }
            });
            console.log("Modello caricato e stanze cliccabili identificate.");

        },
        // Progress (funzione chiamata durante il caricamento)
        function (xhr) {
            const percentLoaded = Math.round(xhr.loaded / xhr.total * 100);
            loadingIndicator.textContent = `Caricamento: ${percentLoaded}%`;
            console.log(`Modello ${percentLoaded}% caricato`);
        },
        // Error (funzione chiamata se il caricamento fallisce)
        function (error) {
            console.error('Errore nel caricamento del modello 3D:', error);
            loadingIndicator.textContent = 'Errore caricamento modello!';
            loadingIndicator.style.color = 'red';
            canvasContainer.classList.remove('loading-model');
            // Potresti voler mostrare i cubi placeholder come fallback qui
            // createPlaceholderCubes();
        }
    );
    // --- FINE CARICAMENTO MODELLO ---*/

    const roomGeometry = new THREE.BoxGeometry(4, 3, 5); // Dimensioni esempio

    const createRoomMesh = (name, color, position) => {
        const material = new THREE.MeshStandardMaterial({
             color: color,
             transparent: true,
             opacity: 0.8,
             roughness: 0.8,
             name: `${name}_Material` // Opzionale: nome al materiale
        });
        const mesh = new THREE.Mesh(roomGeometry, material);
        mesh.name = name; // NOME FONDAMENTALE PER IL CLICK (deve corrispondere a houseData)
        mesh.position.set(position.x, position.y, position.z);
        scene.add(mesh);
        clickableObjects.push(mesh);
        console.log(`Creato cubo placeholder: ${name}`);
    };

    // Posiziona i cubi placeholder
    createRoomMesh("Giardino", 0x98FB98, { x: -3, y: 1.5, z: 0 });
    createRoomMesh("Soggiorno", 0xADD8E6, { x: -3, y: 1.5, z: 0 });
    createRoomMesh("Cucina", 0x90EE90, { x: 3, y: 1.5, z: 0 });
    createRoomMesh("Camera 1", 0xFFB6C1, { x: -3, y: 1.5, z: -6 });
    createRoomMesh("Bagno 1", 0xE0FFFF, { x: 3, y: 1.5, z: -6 }); // Nota: '0 E0FFFF' corretto in '0xE0FFFF'
    createRoomMesh("Garage", 0x808080, { x: -3, y: 1.5, z: 6 });
    // Aggiungi qui gli altri (Camera 2, Camera 3, Bagno 2) posizionandoli
    createRoomMesh("Camera 2", 0xFFE4B5, { x: 3, y: 5.5, z: 0 }); // Esempio secondo piano
    createRoomMesh("Bagno 2", 0xAFEEEE, { x: 3, y: 5.5, z: -6 }); // Esempio secondo piano

    if (!document.querySelector('.glTF-loader-used')) { // Nasconde solo se non stiamo caricando un GLTF
      loadingIndicator.style.display = 'none';
    }
    // --- FINE PLACEHOLDER ---

    // Raycaster per rilevare i click e hover
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Listener per eventi
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onCanvasClick, false);
    renderer.domElement.addEventListener('mousemove', onCanvasMouseMove, false); // Aggiunto per hover
    closeDetailsButton.addEventListener('click', hideRoomDetails);

    // Avvia il loop di rendering
    animate();
}

// --- Loop di Rendering ---
function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update();
    }
    renderer.render(scene, camera);
}

// Listener per il Modal
if (showAllDevicesBtn) {
    console.log("Aggiungo listener al bottone 'Tutti i dispositivi'"); //DEBUG
    showAllDevicesBtn.addEventListener('click', openAllDevicesModal);
} else {
     console.error("Bottone 'show-all-devices-btn' NON trovato!"); //DEBUG
}
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAllDevicesModal);
} else {
     console.error("Bottone chiusura modal NON trovato!"); //DEBUG
}
if (modalOverlay) {
    modalOverlay.addEventListener('click', closeAllDevicesModal);
} else {
     console.error("Overlay modal NON trovato!"); //DEBUG
}

// --- Gestione Ridimensionamento Finestra ---
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
}

// --- Gestione Movimento Mouse sul Canvas (Hover Effect) ---
function onCanvasMouseMove(event) {
    if (!camera || !renderer || !raycaster || !mouse || !clickableObjects.length) return; // Controlla anche se ci sono oggetti cliccabili

    // Calcola posizione normalizzata del mouse
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Aggiorna Raycaster
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, false);

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        // Controlla se è una stanza valida e DIVERSA da quella attualmente hoverata
        if (houseData[hoveredObject.name] && hoveredObject !== currentlyHovered) {
            // Rimuovi effetto hover dal precedente
            if (currentlyHovered) {
                applyHoverEffect(currentlyHovered, false);
            }
            // Applica effetto hover al nuovo e aggiorna tracciamento
            currentlyHovered = hoveredObject;
            applyHoverEffect(currentlyHovered, true);
            canvasContainer.classList.add('room-hovered'); // Cambia cursore
        } else if (!houseData[hoveredObject.name] && currentlyHovered) {
             // Il mouse è passato da un oggetto valido a uno non valido
             applyHoverEffect(currentlyHovered, false);
             currentlyHovered = null;
             canvasContainer.classList.remove('room-hovered');
        }
    } else {
        // Il mouse non è su nessun oggetto cliccabile, rimuovi hover se presente
        if (currentlyHovered) {
            applyHoverEffect(currentlyHovered, false);
            currentlyHovered = null;
            canvasContainer.classList.remove('room-hovered'); // Ripristina cursore
        }
    }
}

// --- Gestione Click sul Canvas ---
function onCanvasClick(event) {
    if (!camera || !renderer || !raycaster || !mouse || !clickableObjects.length) return;

    // Calcola posizione mouse e aggiorna raycaster (come in mousemove)
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects, false);

    // Rimuovi sempre l'effetto hover visivo al click (verrà sostituito da select)
    if (currentlyHovered) {
        applyHoverEffect(currentlyHovered, false);
        canvasContainer.classList.remove('room-hovered');
        currentlyHovered = null;
    }

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const roomName = clickedObject.name;

        if (houseData[roomName]) {
            // Stanza valida cliccata
            console.log("Stanza cliccata:", roomName);
            // Se clicco sulla stanza già selezionata, non faccio nulla o chiudo? Per ora non faccio nulla.
             if (selectedObject !== clickedObject) {
                 displayRoomDetails(roomName);
                 highlightSelectedRoom(clickedObject); // Evidenzia la nuova stanza
             }
        } else {
            // Oggetto 3D cliccato ma non è una stanza mappata
            console.log("Oggetto cliccato non mappato:", clickedObject.name);
            hideRoomDetails(); // Nasconde i dettagli precedenti
            highlightSelectedRoom(null); // Deseleziona tutto
        }
    } else {
        // Cliccato nello spazio vuoto
        console.log("Cliccato fuori dalle stanze.");
        hideRoomDetails(); // Nasconde i dettagli precedenti
        highlightSelectedRoom(null); // Deseleziona tutto
    }
}

// --- Applica Effetto Hover (cambio colore leggero) ---
function applyHoverEffect(object, isHovering) {
    // Non applicare hover all'oggetto già selezionato
    if (!object || !object.material || object === selectedObject) return;

    // Usa emissive per l'hover, così non interferisce troppo col colore base o di selezione
    // Assicurati che il materiale supporti 'emissive' (MeshStandard/Physical sì)
    if (!object.material.originalEmissive) {
         object.material.originalEmissive = object.material.emissive ? object.material.emissive.getHex() : 0x000000;
    }

    if (isHovering) {
        object.material.emissive = new THREE.Color(0x444444); // Grigio chiaro emissivo per hover
    } else {
        object.material.emissive = new THREE.Color(object.material.originalEmissive); // Ripristina emissivo originale
    }
}

// --- Evidenzia Stanza Selezionata (cambio colore più marcato) ---
function highlightSelectedRoom(objectToHighlight) {
    // 1. Resetta l'oggetto precedentemente selezionato
    if (selectedObject && selectedObject !== objectToHighlight) {
         // Ripristina colore e emissive originale
        if(selectedObject.material.originalHex !== undefined) {
            selectedObject.material.color.setHex(selectedObject.material.originalHex);
        }
        if(selectedObject.material.originalEmissive !== undefined) {
             selectedObject.material.emissive.setHex(selectedObject.material.originalEmissive);
        } else {
             // Se non c'era emissive originale, assicurati sia spento
             if(selectedObject.material.emissive) selectedObject.material.emissive.setHex(0x000000);
        }
         // Potresti voler rimuovere le proprietà originalHex/originalEmissive se non servono più
         // delete selectedObject.material.originalHex;
         // delete selectedObject.material.originalEmissive;
    }

    // 2. Evidenzia il nuovo oggetto (se valido)
    if (objectToHighlight && houseData[objectToHighlight.name]) {
        selectedObject = objectToHighlight;

        // Salva stato originale se non già fatto
        if (selectedObject.material.originalHex === undefined) {
            selectedObject.material.originalHex = selectedObject.material.color.getHex();
        }
         if (selectedObject.material.originalEmissive === undefined) {
              selectedObject.material.originalEmissive = selectedObject.material.emissive ? selectedObject.material.emissive.getHex() : 0x000000;
         }

        // Applica un colore di selezione distinto (es. blu) e resetta emissive (l'hover non si applica)
        selectedObject.material.color.setHex(0x007bff); // Blu selezione
        if(selectedObject.material.emissive) selectedObject.material.emissive.setHex(0x000000); // Assicura che non ci sia emissive da hover

    } else {
        // Nessuna selezione valida o deselezione richiesta
        selectedObject = null;
    }
}


// --- Mostra Dettagli Stanza ---
function displayRoomDetails(roomName) {
    const roomData = getRoomData(roomName);
    if (!roomData) return;

    roomNameTitle.textContent = `Dettaglio Stanza: ${roomName}`;
    floorplanImage.src = roomData.floorplan;
    floorplanImage.alt = `Piantina ${roomName}`;
    floorplanImage.onerror = () => {
        floorplanImage.alt = `Immagine piantina per ${roomName} non trovata.`;
    };

    deviceListDiv.innerHTML = ''; // Pulisci lista
    if (roomData.devices && roomData.devices.length > 0) {
        roomData.devices.forEach(device => {
            const controlElement = createDeviceControlElement(device, roomName);
            deviceListDiv.appendChild(controlElement);
        });
    } else {
        deviceListDiv.innerHTML = '<p>Nessun dispositivo domotico configurato per questa stanza.</p>';
    }

    roomDetailsDiv.classList.remove('hidden');

    setTimeout(() => {
        // Verifica nuovamente che l'elemento esista prima dello scroll
        if (roomDetailsDiv) {
             console.log("Scrolling verso #room-details..."); // DEBUG
             roomDetailsDiv.scrollIntoView({
                 behavior: 'smooth', // Animazione di scroll fluida
                 block: 'start'     // Allinea la parte SUPERIORE del pannello con la parte superiore della viewport (o il più vicino possibile)
             });
        }
    }, 150); // 150ms di ritardo, puoi provare a ridurlo (es. 50 o 100) se l'animazione è veloce
    // --- FINE NUOVA PARTE ---
}

// --- Nascondi Dettagli Stanza ---
function hideRoomDetails() {
    roomDetailsDiv.classList.add('hidden');
    // Importante: Deseleziona anche l'oggetto 3D quando si chiudono i dettagli
    highlightSelectedRoom(null);
}

// --- Crea Elemento HTML per Controllo Dispositivo --- (Invariato rispetto a prima versione modulo)
function createDeviceControlElement(device, roomName) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'device-control';
    controlDiv.dataset.deviceId = device.id;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'device-info';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'device-icon';
    updateDeviceIcon(iconSpan, device);

    const nameSpan = document.createElement('span');
    nameSpan.className = 'device-name';
    nameSpan.textContent = device.name;

    infoDiv.appendChild(iconSpan);
    infoDiv.appendChild(nameSpan);

    const statusSpan = document.createElement('span');
    statusSpan.className = 'device-status';
    updateDeviceStatusText(statusSpan, device);

    infoDiv.appendChild(statusSpan);
    controlDiv.appendChild(infoDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'device-actions';

    if (['light', 'door', 'shutter', 'generic'].includes(device.type)) {
        const button = document.createElement('button');
        updateDeviceButton(button, device);

        button.addEventListener('click', () => {
            toggleDeviceStatus(device.id);
            const updatedDevice = getDeviceById(device.id);
            if (updatedDevice) {
                 updateDeviceButton(button, updatedDevice);
                 updateDeviceIcon(iconSpan, updatedDevice);
                 updateDeviceStatusText(statusSpan, updatedDevice);
            }
        });
        actionsDiv.appendChild(button);
    }
    controlDiv.appendChild(actionsDiv);

    return controlDiv;
}

// --- Funzioni Helper per Aggiornamento UI Dispositivo --- (Invariate)
function updateDeviceIcon(iconElement, device) {
    iconElement.classList.remove( 'light-on', 'light-off', 'door-open', 'door-closed', 'sensor', 'generic-device', 'generic-on', 'generic-off' );
    switch (device.type) {
        case 'light': iconElement.classList.add(device.status === 'on' ? 'light-on' : 'light-off'); break;
        case 'door': case 'shutter': iconElement.classList.add(device.status === 'open' ? 'door-open' : 'door-closed'); break;
        case 'sensor': iconElement.classList.add('sensor'); break;
        case 'generic': iconElement.classList.add('generic-device', device.status === 'on' ? 'generic-on' : 'generic-off'); break;
        default: iconElement.classList.add('generic-device');
    }
}
function updateDeviceStatusText(statusElement, device) {
    if (device.type === 'sensor') { statusElement.textContent = `(${device.value !== undefined ? device.value : ''}${device.unit || ''})`; }
    else if (['light', 'door', 'shutter', 'generic'].includes(device.type)) { statusElement.textContent = `(${device.status || 'unknown'})`; }
    else { statusElement.textContent = ''; }
}
function updateDeviceButton(buttonElement, device) {
    let buttonText = '', buttonClass = '';
    switch (device.type) {
        case 'light': case 'generic': buttonText = (device.status === 'on' ? 'Spegni' : 'Accendi'); buttonClass = (device.status === 'on' ? 'button-on' : 'button-off'); break;
        case 'door': case 'shutter': buttonText = (device.status === 'open' ? 'Chiudi' : 'Apri'); buttonClass = (device.status === 'open' ? 'button-open' : 'button-closed'); break;
        default: buttonElement.style.display = 'none'; return;
    }
    buttonElement.textContent = buttonText;
    buttonElement.classList.remove('button-on', 'button-off', 'button-open', 'button-closed');
    if (buttonClass) buttonElement.classList.add(buttonClass);
    buttonElement.style.display = '';
}

// --- Logica di Simulazione Cambio Stato Dispositivo --- (Invariata)
function toggleDeviceStatus(deviceId) {
    const device = getDeviceById(deviceId);
    if (!device) { console.error("Simulazione Toggle: Dispositivo non trovato:", deviceId); return; }
    console.log(`Simulazione Toggle per ${device.name}. Stato attuale: ${device.status}`);
    switch (device.type) {
        case 'light': case 'generic': device.status = (device.status === 'on' ? 'off' : 'on'); break;
        case 'door': case 'shutter': device.status = (device.status === 'open' ? 'closed' : 'open'); break;
        case 'sensor': console.log("I sensori non cambiano stato."); return;
        default: console.warn(`Tipo dispositivo non gestito: ${device.type}`); return;
    }
    console.log(`Nuovo stato simulato: ${device.status}`);
}

// --- NUOVE FUNZIONI PER IL MODAL ---

// Popola il contenuto del modal con tutti i dispositivi
function populateAllDevicesModal() {
    if (!modalDeviceListDiv) return;
    modalDeviceListDiv.innerHTML = ''; // Pulisci contenuto precedente

    let deviceCount = 0;

    // Itera su ogni stanza definita in houseData (assicurati che houseData sia globale)
    for (const roomName in houseData) {
        if (houseData.hasOwnProperty(roomName)) {
            const roomData = houseData[roomName];

            // Mostra la stanza solo se ha dispositivi
            if (roomData.devices && roomData.devices.length > 0) {
                 const roomGroupDiv = document.createElement('div');
                 roomGroupDiv.className = 'room-group';

                 const roomTitle = document.createElement('h4');
                 roomTitle.textContent = roomName;
                 roomGroupDiv.appendChild(roomTitle);

                 // Itera sui dispositivi della stanza
                 roomData.devices.forEach(device => {
                      // RIUTILIZZA la funzione esistente per creare l'elemento di controllo!
                      const deviceControlElement = createDeviceControlElement(device, roomName);
                      roomGroupDiv.appendChild(deviceControlElement);
                      deviceCount++;
                 });

                 modalDeviceListDiv.appendChild(roomGroupDiv);
            }
        }
    }

    // Messaggio se non ci sono dispositivi in assoluto
    if (deviceCount === 0) {
        modalDeviceListDiv.innerHTML = '<p>Nessun dispositivo domotico trovato nella casa.</p>';
    }
}

// Apre il modal
function openAllDevicesModal() {
    populateAllDevicesModal(); // Riempi il modal con i dati aggiornati
    if (modalOverlay) modalOverlay.classList.add('visible');
    if (allDevicesModal) allDevicesModal.classList.add('visible');
     // Opzionale: impedisci lo scroll del body quando il modal è aperto
     document.body.style.overflow = 'hidden';
}

// Chiude il modal
function closeAllDevicesModal() {
    if (modalOverlay) modalOverlay.classList.remove('visible');
    if (allDevicesModal) allDevicesModal.classList.remove('visible');
    // Opzionale: Svuota contenuto per liberare memoria (se molti elementi)
    // if (modalDeviceListDiv) modalDeviceListDiv.innerHTML = '';
     // Opzionale: riabilita lo scroll del body
     document.body.style.overflow = '';
}

// --- Avvio ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init3D);
} else {
    init3D();
}
