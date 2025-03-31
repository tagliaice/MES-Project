
 const houseData = {
    "Soggiorno": { // <-- Questo nome DEVE corrispondere al nome della Mesh 3D
        floorplan: 'images/Soggiorno.jpeg',
        devices: [
            { id: 'soggiorno_luce1', name: 'Luce Principale', type: 'light', status: 'off' },
            { id: 'soggiorno_tv', name: 'Smart TV', type: 'generic', status: 'off' }, // Esempio dispositivo generico
            { id: 'soggiorno_temp', name: 'Termostato', type: 'sensor', value: 21, unit: '°C' }
        ]
    },
    "Cucina": { // <-- Corrispondenza Mesh 3D
        floorplan: 'images/Cucina.jpeg',
        devices: [
            { id: 'cucina_luce_led', name: 'Striscia LED', type: 'light', status: 'on' },
            { id: 'cucina_frigo', name: 'Frigorifero Smart', type: 'sensor', value: 4, unit: '°C' },
            { id: 'cucina_finestra', name: 'Sensore Finestra', type: 'door', status: 'closed' } // Usiamo 'door' per apribile
        ]
    },
    "Camera 1": { // <-- Corrispondenza Mesh 3D (Attenzione agli spazi!)
        floorplan: 'images/Camera1.jpeg',
        devices: [
            { id: 'cam1_luce_letto', name: 'Luce Comodino', type: 'light', status: 'off' },
            { id: 'cam1_tapparella', name: 'Tapparella', type: 'shutter', status: 'closed' } // Tipo specifico tapparella
        ]
    },
    "Camera 2": {
        floorplan: 'images/Camera2.jpeg',
        devices: [
            { id: 'cam2_luce', name: 'Luce Scrivania', type: 'light', status: 'off' },
            { id: 'cam2_temp', name: 'Sensore Temperatura', type: 'sensor', value: 22, unit: '°C' }
        ]
    },
    "Bagno 1": {
        floorplan: 'images/Bagno1.jpeg',
        devices: [
            { id: 'bagno1_luce_specchio', name: 'Luce Specchio', type: 'light', status: 'off' },
            { id: 'bagno1_umidita', name: 'Sensore Umidità', type: 'sensor', value: 55, unit: '%' }
        ]
    },
    "Bagno 2": {
        floorplan: 'images/Bagno2.jpeg',
        devices: [
            { id: 'bagno2_luce', name: 'Luce Principale', type: 'light', status: 'on' },
            { id: 'bagno2_aspiratore', name: 'Aspiratore', type: 'generic', status: 'off' } // On/Off generico
        ]
    },
    "Garage": {
        floorplan: 'images/Garage.jpeg',
        devices: [
            { id: 'garage_luce', name: 'Luce Garage', type: 'light', status: 'off' },
            { id: 'garage_porta', name: 'Porta Basculante', type: 'door', status: 'closed' }
        ]
    },
    "Giardino": {
        floorplan: 'images/Giardino.jpeg',
        devices: [
            { id: 'giardino_luci', name: 'Luci Giardino', type: 'light', status: 'off' },
            { id: 'giardino_stereo', name: 'Stereo Giardino', type: 'stereo', status: 'off' }
        ]
    }
    // Aggiungi altre aree se necessario (es. corridoio, giardino?)
};

// Funzione helper (opzionale) per accedere ai dati
 function getRoomData(roomName) {
    return houseData[roomName];
}

 function getDeviceById(deviceId) {
    for (const roomName in houseData) {
        const device = houseData[roomName].devices.find(d => d.id === deviceId);
        if (device) {
            return device;
        }
    }
    return null; // Dispositivo non trovato
}