(function () {
  "use strict";
  /* Datos del salón (FICTICIOS: web de demostración). */
  window.__BRAND__ = {
    name: "ONDA · Peluquería",
    address: "Carrer de l'Onda, 7 · 08000 Barcelona (ficticia)",
    phone: "+34 000 000 000",
    email: "hola@onda.example",

    /* 0 = domingo … 6 = sábado */
    hours: {
      0: [],
      1: [],
      2: [["10:00", "20:00"]],
      3: [["10:00", "20:00"]],
      4: [["10:00", "21:00"]],
      5: [["10:00", "21:00"]],
      6: [["09:00", "15:00"]]
    },

    /* Servicios que se pueden reservar online: min = duración en minutos */
    services: [
      { id: "corte-mujer",  name: "Corte y peinado",        price: 38, min: 60,  note: "Lavado, corte y secado" },
      { id: "corte-hombre", name: "Corte de caballero",     price: 22, min: 30,  note: "Tijera o máquina, con lavado" },
      { id: "rizos",        name: "Corte de rizos en seco", price: 48, min: 75,  note: "Método rizo a rizo" },
      { id: "color",        name: "Color raíz",             price: 42, min: 90,  note: "Tinte vegano sin amoniaco" },
      { id: "mechas",       name: "Balayage",               price: 95, min: 150, note: "Aclarado a mano alzada" },
      { id: "tratamiento",  name: "Tratamiento hidratante", price: 28, min: 30,  note: "Mascarilla y masaje craneal" },
      { id: "infantil",     name: "Corte infantil",         price: 16, min: 30,  note: "Hasta 10 años" }
    ],

    /* Estilistas: días que trabajan (0–6) y suplemento */
    stylists: [
      { id: "cualquiera", name: "Sin preferencia", role: "El primer hueco libre", initials: "✦", days: [2, 3, 4, 5, 6], extra: 0 },
      { id: "nuria",      name: "Núria",  role: "Directora · color",   initials: "N", days: [2, 3, 4, 5], extra: 10 },
      { id: "jan",        name: "Jan",    role: "Cortes y caballero",  initials: "J", days: [3, 4, 5, 6], extra: 0 },
      { id: "aisha",      name: "Aisha",  role: "Rizos y texturas",    initials: "A", days: [2, 4, 5, 6], extra: 0 },
      { id: "pol",        name: "Pol",    role: "Balayage",            initials: "P", days: [2, 3, 5, 6], extra: 5 }
    ]
  };
})();
