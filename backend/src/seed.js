// ============================================
// SEED.JS - Datos de prueba mejorados
// ============================================
// Ejecutar con: node src/seed.js
// ============================================
import "dotenv/config";
import { sequelize } from "./config/db.js";
import {
  User,
  Student,
  Curso,
  Nota,
  Pago,
  Asistencia,
  Comunicado,
  Grado,
  Seccion,
} from "./models/index.js";

const seed = async () => {
  try {
    console.log("Iniciando seed de datos relacionales...\n");

    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // ── 0. CREAR ESTRUCTURA ACADÉMICA ──────────
    console.log("Creando grados y secciones...");
    const [grado5to] = await Grado.findOrCreate({
      where: { nombre: "5to Secundaria" },
      defaults: { nivel: "SECUNDARIA" },
    });
    const [seccionA] = await Seccion.findOrCreate({
      where: { nombre: "A" },
    });

    // ── 1. CREAR ADMIN ─────────────────────────
    const [admin, adminCreated] = await User.findOrCreate({
      where: { email: "admin@colegio.com" },
      defaults: {
        password: "Admin123!",
        role: "ADMIN",
        nombre: "Carlos",
        apellido: "Administrador",
      },
    });
    console.log(adminCreated ? "Admin creado" : "Admin ya existe");

    // ── 2. CREAR PROFESOR ──────────────────────
    const [teacher, teacherCreated] = await User.findOrCreate({
      where: { email: "profesor@colegio.com" },
      defaults: {
        password: "Profesor123!",
        role: "TEACHER",
        nombre: "María",
        apellido: "García",
      },
    });
    console.log(teacherCreated ? "Profesor creado" : "Profesor ya existe");

    // ── 3. CREAR ALUMNO ────────────────────────
    const [studentUser, studentCreated] = await User.findOrCreate({
      where: { email: "alumno@colegio.com" },
      defaults: {
        password: "Alumno123!",
        role: "STUDENT",
        nombre: "Juan",
        apellido: "Pérez",
      },
    });
    console.log(studentCreated ? "Alumno creado" : "Alumno ya existe");

    // Crear/Actualizar perfil Student
    const [studentProfile] = await Student.findOrCreate({
      where: { userId: studentUser.id },
      defaults: {
        promedioGeneral: 0,
        estadoPago: false,
        grado: "5to", // compatible
        seccion: "A", // compatible
        gradoId: grado5to.id,
        seccionId: seccionA.id,
      },
    });

    // Si ya existía, actualizar IDs para asegurar que se vea en el nuevo UI
    await studentProfile.update({
      gradoId: grado5to.id,
      seccionId: seccionA.id,
    });

    // ── 4. CREAR CURSOS ──────────────
    const [curso] = await Curso.findOrCreate({
      where: {
        nombre: "Matemáticas",
        gradoId: grado5to.id,
        seccionId: seccionA.id,
      },
      defaults: {
        descripcion: "Curso de Matemáticas avanzado",
        grado: "5to",
        seccion: "A",
        gradoId: grado5to.id,
        seccionId: seccionA.id,
        teacherId: teacher.id,
        horario: "Lunes y Miércoles 08:00 - 10:00",
      },
    });

    const [curso2] = await Curso.findOrCreate({
      where: {
        nombre: "Comunicación",
        gradoId: grado5to.id,
        seccionId: seccionA.id,
      },
      defaults: {
        descripcion: "Curso de Comunicación integral",
        grado: "5to",
        seccion: "A",
        gradoId: grado5to.id,
        seccionId: seccionA.id,
        teacherId: teacher.id,
        horario: "Martes y Jueves 09:00 - 11:30",
      },
    });

    // ── 5. CREAR NOTAS ──────────────
    await Nota.findOrCreate({
      where: {
        studentId: studentProfile.id,
        cursoId: curso.id,
        trimestre: "PRIMERO",
      },
      defaults: { valor: 15.5 },
    });
    await Nota.findOrCreate({
      where: {
        studentId: studentProfile.id,
        cursoId: curso2.id,
        trimestre: "PRIMERO",
      },
      defaults: { valor: 17.0 },
    });

    // ── 6. CREAR PAGO ───────────────
    await Pago.findOrCreate({
      where: { studentId: studentProfile.id, concepto: "Matrícula 2026" },
      defaults: {
        monto: 500.0,
        fechaPago: "2026-03-01",
        metodoPago: "TRANSFERENCIA",
        estado: "PAGADO",
      },
    });

    // ── 7. CREAR ASISTENCIA ─────────
    await Asistencia.findOrCreate({
      where: {
        studentId: studentProfile.id,
        cursoId: curso.id,
        fecha: "2026-03-10",
      },
      defaults: { estado: "PRESENTE" },
    });

    // ── 8. CREAR COMUNICADO ─────────
    await Comunicado.findOrCreate({
      where: { titulo: "Bienvenidos al Año Escolar 2026" },
      defaults: {
        contenido:
          "Les damos la bienvenida al nuevo año escolar. Las clases inician el 10 de marzo.",
        tipo: "GENERAL",
        authorId: admin.id,
      },
    });

    console.log("\n SEED COMPLETADO Y ACTUALIZADO PARA NUEVO UI");
    process.exit(0);
  } catch (error) {
    console.error("Error en seed:", error);
    process.exit(1);
  }
};

seed();
