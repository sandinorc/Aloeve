/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pagos");
  collection.indexes.push("CREATE INDEX idx_pagos_clienteId ON pagos (clienteId)");
  collection.indexes.push("CREATE INDEX idx_pagos_facilitadorId ON pagos (facilitadorId)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pagos");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_pagos_clienteId"));
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_pagos_facilitadorId"));
  return app.save(collection);
})