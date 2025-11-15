console.log("=== SISTEMA DE GESTIÓN DE BIBLIOTECA ===\n");

// Base de datos de libros
const libros = [
  {
    id: 1,
    titulo: "JavaScript: The Good Parts",
    autor: "Douglas Crockford",
    genero: "Programación",
    disponible: true,
    vecesSolicitado: 1,
  },
  {
    id: 2,
    titulo: "Clean Code",
    autor: "Robert C. Martin",
    genero: "Programación",
    disponible: false,
    vecesSolicitado: 1,
  },
  {
    id: 3,
    titulo: "The Pragmatic Programmer",
    autor: "Andrew Hunt",
    genero: "Programación",
    disponible: true,
    vecesSolicitado: 0,
  },
  {
    id: 4,
    titulo: "1984",
    autor: "George Orwell",
    genero: "Ficción",
    disponible: true,
    vecesSolicitado: 0,
  },
  {
    id: 5,
    titulo: "To Kill a Mockingbird",
    autor: "Harper Lee",
    genero: "Ficción",
    disponible: false,
    vecesSolicitado: 1,
  },
];

// Base de datos de usuarios
const usuarios = [
  {
    id: 1,
    nombre: "Juan Perez",
    edad: 25,
    prestamos: [
      {
        idLibro: 1,
        descripcion: "JavaScript: The Good Parts",
        fechaEntrega: new Date("2025-10-10"),
        FechaDevolucion: new Date("2025-11-08"),
        multa: 0,
      },
      {
        idLibro: 2,
        descripcion: "Clean Code",
        fechaEntrega: new Date("2025-10-10"),
        FechaDevolucion: undefined,
        multa: 0,
      },
    ],
  },
  {
    id: 2,
    nombre: "Marcela Ayala",
    edad: 42,
    prestamos: [
      {
        idLibro: 5,
        descripcion: "To Kill a Mockingbird",
        fechaEntrega: new Date("2025-11-14"),
        FechaDevolucion: undefined,
        multa: 0,
      },
    ],
  },
];

// Sistema de gestión (libros)
const biblioteca = {
  // Obtener libros disponibles
  obtenerDisponibles() {
    return libros.filter((libro) => libro.disponible);
  },

  // Buscar libros por título, autor o genero
  buscar(criterio) {
    const termino = omitirAcentos(criterio.toLowerCase());

    return libros.filter(
      (libro) =>
        omitirAcentos(libro.titulo.toLowerCase()).includes(termino) ||
        omitirAcentos(libro.autor.toLowerCase()).includes(termino) ||
        omitirAcentos(libro.genero.toLocaleLowerCase()).includes(termino)
    );
  },

  // Prestar libro
  prestar(idLibro, idUsuario) {
    const libro = libros.find((l) => l.id === idLibro);
    const usuarioEncontrado = usuario.buscar(idUsuario);

    if (!libro) return { exito: false, mensaje: "Libro no encontrado" };
    if (!libro.disponible)
      return { exito: false, mensaje: "Libro no disponible" };

    if (typeof idUsuario !== "number")
      return { exito: false, mensaje: "ID de usuario no valida" };

    if (usuarioEncontrado.length === 0)
      return { exito: false, mensaje: "Usuario no encontrado" };

    usuarioEncontrado[0].prestamos.push({
      idLibro: libro.id,
      descripcion: libro.titulo,
      fechaEntrega: new Date(),
      FechaDevolucion: undefined,
      multa: 0,
    });

    libro.disponible = false;
    libro.vecesSolicitado++;

    return {
      exito: true,
      mensaje: `Libro "${libro.titulo}" prestado exitosamente a ${usuarioEncontrado[0].nombre}`,
    };
  },

  // Devolver libro
  devolver(idLibro, idUsuario) {
    const libro = libros.find((l) => l.id === idLibro);
    const usuarioEncontrado = usuario.buscar(idUsuario);

    if (!libro) return { exito: false, mensaje: "Libro no encontrado" };
    if (libro.disponible)
      return { exito: false, mensaje: "Este libro ya está disponible" };

    if (typeof idUsuario !== "number")
      return { exito: false, mensaje: "ID de usuario no valida" };

    if (usuarioEncontrado.length === 0)
      return { exito: false, mensaje: "Usuario no encontrado" };

    // Busca y encuentra indice en array de libros prestados
    const indexLibro = usuarioEncontrado[0].prestamos.findIndex(
      ({ idLibro, FechaDevolucion }) =>
        libro.id === idLibro && FechaDevolucion === undefined
    );

    // Estimar fecha de devolucion en 30 dias a partir de la fecha de entrega
    const registro = usuarioEncontrado[0].prestamos[indexLibro];
    const FechaDevolucionEstimativa = new Date(registro.fechaEntrega);
    FechaDevolucionEstimativa.setDate(registro.fechaEntrega.getDate() + 30);

    // Obtener cantidad de dias extras para aplicar multa
    const diferenciaDias = new Date() - FechaDevolucionEstimativa;
    const diasTranscurridos = Math.floor(
      diferenciaDias / (1000 * 60 * 60 * 24)
    );

    // Calcular total a pagar por concepto de multa ($500 CLP x dia)
    const multa = diasTranscurridos >= 0 ? diasTranscurridos * 500 : 0;

    // Registra la fecha en la que el libro fue devuelto
    registro.multa = multa;
    registro.FechaDevolucion = new Date();
    libro.disponible = true;

    return {
      exito: true,
      mensaje: `Libro "${libro.titulo}" devuelto exitosamente por ${usuarioEncontrado[0].nombre}`,
    };
  },

  // Estadísticas
  obtenerEstadisticas() {
    const total = libros.length;
    const disponibles = libros.filter((l) => l.disponible).length;
    const prestados = total - disponibles;

    // Agrupar por género usando reduce
    const porGenero = libros.reduce((acc, libro) => {
      acc[libro.genero] = (acc[libro.genero] || 0) + 1;
      return acc;
    }, {});

    return { total, disponibles, prestados, porGenero };
  },
};

// Sistema de gestión (usuarios)
const usuario = {
  // Obtener usuarios
  obtenerUsuarios() {
    return usuarios;
  },

  // Buscar usuario por nombre o id
  buscar(criterio) {
    let termino;

    if (criterio === undefined)
      throw new Error("No se ingreso criterio de busqueda");
    if (typeof criterio === "number") termino = criterio;
    if (typeof criterio === "string")
      termino = omitirAcentos(criterio.toLowerCase());

    return usuarios.filter((usuario) => {
      return (
        omitirAcentos(usuario.nombre.toLowerCase()).includes(termino) ||
        usuario.id === termino
      );
    });
  },
};

// Omite acentos para criterio de busqueda
function omitirAcentos(criterio) {
  return criterio
    .replaceAll("á", "a")
    .replaceAll("é", "e")
    .replaceAll("í", "i")
    .replaceAll("ó", "o")
    .replaceAll("ú", "u");
}

console.log("📚 USUARIOS REGISTRADOS:");
console.log(usuario.obtenerUsuarios());

console.log(biblioteca.prestar(1, 1));
console.log(biblioteca.devolver(2, 1));

// console.log("\n🔍 BÚSQUEDA 'Juan':");
// usuario.buscar("Juan").forEach(({ id, nombre, prestamos }) => {
//   console.log(`- ${id}: ${nombre} (prestamos: ${prestamos.length})`);
// });

console.log("\n🔍 BÚSQUEDA 'Juan':");
usuario.buscar("Juan").forEach((usuario) => {
  console.log(usuario);
});

// // Demostraciones prácticas
// console.log("📚 LIBROS DISPONIBLES:");
// biblioteca.obtenerDisponibles().forEach(({ titulo, autor }) => {
//   console.log(`- "${titulo}" por ${autor}`);
// });

// console.log("\n🔍 BÚSQUEDA 'JavaScript':");
// biblioteca.buscar("JavaScript").forEach(({ titulo, autor }) => {
//   console.log(`- "${titulo}" por ${autor}`);
// });

// console.log("\n🔍 BÚSQUEDA 'Programación':");
// biblioteca.buscar("programacion").forEach(({ titulo, autor }) => {
//   console.log(`- "${titulo}" por ${autor}`);
// });

// console.log("\n📊 ESTADÍSTICAS:");
// const stats = biblioteca.obtenerEstadisticas();
// console.log(`Total de libros: ${stats.total}`);
// console.log(`Disponibles: ${stats.disponibles}`);
// console.log(`Prestados: ${stats.prestados}`);
// console.log("Por género:", stats.porGenero);

// console.log("\n📖 OPERACIONES DE PRÉSTAMO:");
// console.log(biblioteca.prestar(1).mensaje);
// console.log(biblioteca.prestar(1).mensaje); // Intento fallido
// console.log(biblioteca.devolver(1).mensaje);

// console.log("\n=== DEMOSTRACIÓN DE DESTRUCTURING ===\n");

// // Función que usa destructuring extensivamente
// function procesarPrestamo({ id, titulo, autor, disponible }) {
//   if (!disponible) {
//     return `❌ "${titulo}" no está disponible`;
//   }

//   const resultado = biblioteca.prestar(id);
//   return resultado.exito
//     ? `✅ ${resultado.mensaje}`
//     : `❌ ${resultado.mensaje}`;
// }

// // Procesar múltiples libros con destructuring
// const librosParaProcesar = [
//   {
//     id: 1,
//     titulo: "JavaScript: The Good Parts",
//     autor: "Douglas Crockford",
//     disponible: true,
//   },
//   { id: 4, titulo: "1984", autor: "George Orwell", disponible: true },
// ];

// librosParaProcesar.forEach((libro) => {
//   console.log(procesarPrestamo(libro));
// });

// // Destructuring en bucles
// console.log("\n📋 LISTADO DE LIBROS CON DESTRUCTURING:");
// for (const { titulo, autor, genero, disponible } of libros) {
//   const estado = disponible ? "✅ Disponible" : "❌ Prestado";
//   console.log(`${titulo} - ${autor} (${genero}) ${estado}`);
// }

// // Estadísticas avanzadas usando métodos modernos
// console.log("\n🎯 ANÁLISIS AVANZADO:");
// const librosPorGenero = libros.reduce((acc, { genero, disponible }) => {
//   if (!acc[genero]) acc[genero] = { total: 0, disponibles: 0 };
//   acc[genero].total++;
//   if (disponible) acc[genero].disponibles++;
//   return acc;
// }, {});

// Object.entries(librosPorGenero).forEach(([genero, stats]) => {
//   console.log(`${genero}: ${stats.disponibles}/${stats.total} disponibles`);
// });
