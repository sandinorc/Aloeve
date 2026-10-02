/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let collection = new Collection({
        type: "auth",
        name: "usuarios",
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.role = 'Fundadora'",
        updateRule: "@request.auth.id = id || @request.auth.role = 'Fundadora'",
        deleteRule: "@request.auth.role = 'Fundadora'",
        authRule: "",
        fields: [
        {
                "hidden": false,
                "id": "text8422776445",
                "name": "nombre_completo",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
        },
        {
                "hidden": false,
                "id": "select2361819346",
                "name": "rol",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "Fundadora",
                        "Studio Manager",
                        "Host",
                        "Facilitador",
                        "Admin"
                ]
        },
        {
                "hidden": false,
                "id": "select1723313445",
                "name": "estado",
                "presentable": false,
                "primaryKey": false,
                "required": true,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                        "Activo",
                        "Inactivo"
                ]
        },
        {
                "hidden": false,
                "id": "autodate6163176149",
                "name": "fecha_creacion",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "autodate",
                "onCreate": true,
                "onUpdate": false
        },
        {
                "hidden": false,
                "id": "date7374517144",
                "name": "ultimo_acceso",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
        }
],
    })

    try {
        app.save(collection)
    } catch (e) {
        if (e.message.includes("Collection name must be unique")) {
            console.log("Collection already exists, skipping")
            return
        }
        throw e
    }
}, (app) => {
    try {
        let collection = app.findCollectionByNameOrId("usuarios")
        app.delete(collection)
    } catch (e) {
        if (e.message.includes("no rows in result set")) {
            console.log("Collection not found, skipping revert");
            return;
        }
        throw e;
    }
})