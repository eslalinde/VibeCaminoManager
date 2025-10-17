-- SEED SQL PARA CAMINOMANAGER
-- Países
INSERT INTO countries (id, name, code) VALUES (1, 'Colombia', 'CO');

-- Estados (Departamentos)
INSERT INTO states (id, name, country_id) VALUES
  (1, 'Amazonas', 1),
  (2, 'Antioquia', 1),
  (3, 'Arauca', 1),
  (4, 'Atlántico', 1),
  (5, 'Bolívar', 1),
  (6, 'Boyacá', 1),
  (7, 'Caldas', 1),
  (8, 'Caquetá', 1),
  (9, 'Casanare', 1),
  (10, 'Cauca', 1),
  (11, 'Cesar', 1),
  (12, 'Chocó', 1),
  (13, 'Córdoba', 1),
  (14, 'Cundinamarca', 1),
  (15, 'Guainía', 1),
  (16, 'Guaviare', 1),
  (17, 'Huila', 1),
  (18, 'La Guajira', 1),
  (19, 'Magdalena', 1),
  (20, 'Meta', 1),
  (21, 'Nariño', 1),
  (22, 'Norte de Santander', 1),
  (23, 'Putumayo', 1),
  (24, 'Quindío', 1),
  (25, 'Risaralda', 1),
  (26, 'San Andrés y Providencia', 1),
  (27, 'Santander', 1),
  (28, 'Sucre', 1),
  (29, 'Tolima', 1),
  (30, 'Valle del Cauca', 1),
  (31, 'Vaupés', 1),
  (32, 'Vichada', 1);

-- Ciudades (capitales de los departamentos)
INSERT INTO cities (id, name, country_id, state_id) VALUES
  (1, 'Leticia', 1, 1),
  (2, 'Medellín', 1, 2),
  (3, 'Arauca', 1, 3),
  (4, 'Barranquilla', 1, 4),
  (5, 'Cartagena de Indias', 1, 5),
  (6, 'Tunja', 1, 6),
  (7, 'Manizales', 1, 7),
  (8, 'Florencia', 1, 8),
  (9, 'Yopal', 1, 9),
  (10, 'Popayán', 1, 10),
  (11, 'Valledupar', 1, 11),
  (12, 'Quibdó', 1, 12),
  (13, 'Montería', 1, 13),
  (14, 'Bogotá', 1, 14),
  (15, 'Inírida', 1, 15),
  (16, 'San José del Guaviare', 1, 16),
  (17, 'Neiva', 1, 17),
  (18, 'Riohacha', 1, 18),
  (19, 'Santa Marta', 1, 19),
  (20, 'Villavicencio', 1, 20),
  (21, 'Pasto', 1, 21),
  (22, 'Cúcuta', 1, 22),
  (23, 'Mocoa', 1, 23),
  (24, 'Armenia', 1, 24),
  (25, 'Pereira', 1, 25),
  (26, 'San Andrés', 1, 26),
  (27, 'Bucaramanga', 1, 27),
  (28, 'Sincelejo', 1, 28),
  (29, 'Ibagué', 1, 29),
  (30, 'Cali', 1, 30),
  (31, 'Mitú', 1, 31),
  (32, 'Puerto Carreño', 1, 32);

-- TeamTypes
INSERT INTO team_types (id, name, order_num) VALUES
  (1, 'Catequistas de la Nación', 1),
  (2, 'Itinerantes', 2),
  (3, 'Catequistas', 3),
  (4, 'Responsables', 4);

-- StepWays
INSERT INTO step_ways (id, name, order_num) VALUES
  (1, 'Catequesis iniciales', 1),
  (2, '1º Escrutinio Bautismal', 2),
  (3, 'Shemá Israel', 3),
  (4, '2º Escrutinio Bautismal', 4),
  (5, '1ª Iniciación a la Oración', 5),
  (6, 'Traditio Symboli', 6),
  (7, 'Redditio Symboli', 7),
  (8, '2ª Iniciación a la Oración: Padrenuestro', 8),
  (9, '3º Escrutinio Bautismal', 9),
  (10, 'Renovación Promesas Bautismales', 10);

-- Parishes
INSERT INTO parishes (id, name, diocese, address, phone, email, city_id) VALUES
  (1, 'Parroquia La Visitación', 'Diócesis de Medellín', 'Calle 12 #35-21, Medellín', '3065874400', 'pquia.visitacion@iglesia.org', 2),
  (2, 'Parroquia Santa María de los Ángeles', 'Diócesis de Medellín', 'Carrera 43A #18-60, Medellín', '3065874401', 'sma.angeles@iglesia.org', 2),
  (3, 'Parroquia La Balbanera', 'Diócesis de Medellín', 'Calle 30 #65-50, Medellín', '3065874402', 'balbanera@iglesia.org', 2),
  (4, 'Parroquia Santuario Niño Jesús de Praga', 'Diócesis de Medellín', 'Carrera 50 #49-30, Medellín', '3065874403', 'ninojesus.praga@iglesia.org', 2),
  (5, 'Parroquia Nuestra Señora del Sagrado Corazón', 'Diócesis de Medellín', 'Calle 45 #80-20, Medellín', '3065874404', 'ns.sagradocorazon@iglesia.org', 2),
  (6, 'Parroquia María Madre Admirable', 'Diócesis de Medellín', 'Carrera 70 #32-15, Medellín', '3065874405', 'madre.admirable@iglesia.org', 2),
  (7, 'Parroquia El Señor de las Misericordias', 'Diócesis de Medellín', 'Calle 50 #40-10, Medellín', '3065874406', 'senor.misericordias@iglesia.org', 2),
  (8, 'Parroquia San José de El Poblado', 'Diócesis de Medellín', 'Carrera 43A #9-50, Medellín', '3065874407', 'san.jose.poblado@iglesia.org', 2),
  (9, 'Parroquia San Joaquín', 'Diócesis de Medellín', 'Calle 42 #68-20, Medellín', '3065874408', 'san.joaquin@iglesia.org', 2),
  (10, 'Parroquia San Cayetano', 'Diócesis de Medellín', 'Carrera 65 #48-30, Medellín', '3065874409', 'san.cayetano@iglesia.org', 2),
  (11, 'Parroquia San Juan Bosco', 'Diócesis de Medellín', 'Calle 44 #80-15, Medellín', '3065874410', 'san.juanbosco@iglesia.org', 2),
  (12, 'Parroquia San Antonio de Padua', 'Diócesis de Medellín', 'Carrera 52 #49-20, Medellín', '3065874411', 'san.antonio.padua@iglesia.org', 2),
  (13, 'Parroquia Nuestra Señora de Chiquinquirá', 'Diócesis de Medellín', 'Calle 54 #80-30, Medellín', '3065874412', 'ns.chiquinquira@iglesia.org', 2),
  (14, 'Parroquia Nuestra Señora de Belén', 'Diócesis de Medellín', 'Carrera 76 #32-20, Medellín', '3065874413', 'ns.belen@iglesia.org', 2),
  (15, 'Parroquia Nuestra Señora del Rosario', 'Diócesis de Medellín', 'Calle 51 #50-10, Medellín', '3065874414', 'ns.rosario@iglesia.org', 2),
  (16, 'Parroquia Nuestra Señora de la Candelaria', 'Diócesis de Medellín', 'Carrera 50 #51-30, Medellín', '3065874415', 'ns.candelaria@iglesia.org', 2),
  (17, 'Parroquia Nuestra Señora de Fátima', 'Diócesis de Medellín', 'Calle 60 #80-40, Medellín', '3065874416', 'ns.fatima@iglesia.org', 2),
  (18, 'Parroquia Nuestra Señora de Guadalupe', 'Diócesis de Medellín', 'Carrera 65 #30-50, Medellín', '3065874417', 'ns.guadalupe@iglesia.org', 2),
  (19, 'Parroquia Nuestra Señora de las Lajas', 'Diócesis de Medellín', 'Calle 70 #80-50, Medellín', '3065874418', 'ns.lajas@iglesia.org', 2),
  (20, 'Parroquia Nuestra Señora de Lourdes', 'Diócesis de Medellín', 'Carrera 80 #32-60, Medellín', '3065874419', 'ns.lourdes@iglesia.org', 2);

-- People
-- 200 personas: 90 hombres, 110 mujeres, 30 matrimonios, presbíteros, solteros, seminaristas, monjas, viudos
INSERT INTO people (id, person_name, phone, mobile, email, person_type_id, gender_id, spouse_id) VALUES
-- Matrimonios (30 parejas = 60 personas)
(1, 'Juan Pérez', '6041000001', '3001000001', 'juan.perez@email.com', 1, 1, 2),
(2, 'María Gómez', '6041000002', '3001000002', 'maria.gomez@email.com', 1, 2, 1),
(3, 'Carlos Rodríguez', '6041000003', '3001000003', 'carlos.rodriguez@email.com', 1, 1, 4),
(4, 'Ana Martínez', '6041000004', '3001000004', 'ana.martinez@email.com', 1, 2, 3),
(5, 'Pedro López', '6041000005', '3001000005', 'pedro.lopez@email.com', 1, 1, 6),
(6, 'Laura Torres', '6041000006', '3001000006', 'laura.torres@email.com', 1, 2, 5),
(7, 'Andrés Ramírez', '6041000007', '3001000007', 'andres.ramirez@email.com', 1, 1, 8),
(8, 'Paula Sánchez', '6041000008', '3001000008', 'paula.sanchez@email.com', 1, 2, 7),
(9, 'Jorge Castro', '6041000009', '3001000009', 'jorge.castro@email.com', 1, 1, 10),
(10, 'Diana Ruiz', '6041000010', '3001000010', 'diana.ruiz@email.com', 1, 2, 9),
(11, 'Miguel Herrera', '6041000011', '3001000011', 'miguel.herrera@email.com', 1, 1, 12),
(12, 'Sofía Mendoza', '6041000012', '3001000012', 'sofia.mendoza@email.com', 1, 2, 11),
(13, 'Ricardo Morales', '6041000013', '3001000013', 'ricardo.morales@email.com', 1, 1, 14),
(14, 'Claudia Jiménez', '6041000014', '3001000014', 'claudia.jimenez@email.com', 1, 2, 13),
(15, 'Felipe Vargas', '6041000015', '3001000015', 'felipe.vargas@email.com', 1, 1, 16),
(16, 'Natalia Castillo', '6041000016', '3001000016', 'natalia.castillo@email.com', 1, 2, 15),
(17, 'Oscar Romero', '6041000017', '3001000017', 'oscar.romero@email.com', 1, 1, 18),
(18, 'Verónica Peña', '6041000018', '3001000018', 'veronica.pena@email.com', 1, 2, 17),
(19, 'David Salazar', '6041000019', '3001000019', 'david.salazar@email.com', 1, 1, 20),
(20, 'Camila Ríos', '6041000020', '3001000020', 'camila.rios@email.com', 1, 2, 19),
(21, 'Julián Cárdenas', '6041000021', '3001000021', 'julian.cardenas@email.com', 1, 1, 22),
(22, 'Valentina Pineda', '6041000022', '3001000022', 'valentina.pineda@email.com', 1, 2, 21),
(23, 'Santiago Silva', '6041000023', '3001000023', 'santiago.silva@email.com', 1, 1, 24),
(24, 'Gabriela Ortega', '6041000024', '3001000024', 'gabriela.ortega@email.com', 1, 2, 23),
(25, 'Mauricio Navarro', '6041000025', '3001000025', 'mauricio.navarro@email.com', 1, 1, 26),
(26, 'Daniela Cardona', '6041000026', '3001000026', 'daniela.cardona@email.com', 1, 2, 25),
(27, 'Sebastián Arias', '6041000027', '3001000027', 'sebastian.arias@email.com', 1, 1, 28),
(28, 'Andrea Molina', '6041000028', '3001000028', 'andrea.molina@email.com', 1, 2, 27),
(29, 'Manuel Espinosa', '6041000029', '3001000029', 'manuel.espinosa@email.com', 1, 1, 30),
(30, 'Patricia Suárez', '6041000030', '3001000030', 'patricia.suarez@email.com', 1, 2, 29),
(31, 'Fernando Ríos', '6041000031', '3001000031', 'fernando.rios@email.com', 1, 1, 32),
(32, 'Marcela Vargas', '6041000032', '3001000032', 'marcela.vargas@email.com', 1, 2, 31),
(33, 'Héctor Gómez', '6041000033', '3001000033', 'hector.gomez@email.com', 1, 1, 34),
(34, 'Paula Jiménez', '6041000034', '3001000034', 'paula.jimenez@email.com', 1, 2, 33),
(35, 'Javier Torres', '6041000035', '3001000035', 'javier.torres@email.com', 1, 1, 36),
(36, 'Sandra Herrera', '6041000036', '3001000036', 'sandra.herrera@email.com', 1, 2, 35),
(37, 'Luis Castaño', '6041000037', '3001000037', 'luis.castano@email.com', 1, 1, 38),
(38, 'Carolina Zapata', '6041000038', '3001000038', 'carolina.zapata@email.com', 1, 2, 37),
(39, 'Martín Quintero', '6041000039', '3001000039', 'martin.quintero@email.com', 1, 1, 40),
(40, 'Lucía Restrepo', '6041000040', '3001000040', 'lucia.restrepo@email.com', 1, 2, 39),
(41, 'Pablo Betancur', '6041000041', '3001000041', 'pablo.betancur@email.com', 1, 1, 42),
(42, 'Adriana Montoya', '6041000042', '3001000042', 'adriana.montoya@email.com', 1, 2, 41),
(43, 'Sergio Hoyos', '6041000043', '3001000043', 'sergio.hoyos@email.com', 1, 1, 44),
(44, 'Beatriz Ospina', '6041000044', '3001000044', 'beatriz.ospina@email.com', 1, 2, 43),
(45, 'Rodrigo Zapata', '6041000045', '3001000045', 'rodrigo.zapata@email.com', 1, 1, 46),
(46, 'Cecilia Cardona', '6041000046', '3001000046', 'cecilia.cardona@email.com', 1, 2, 45),
(47, 'Gustavo Peña', '6041000047', '3001000047', 'gustavo.pena@email.com', 1, 1, 48),
(48, 'Silvia Salazar', '6041000048', '3001000048', 'silvia.salazar@email.com', 1, 2, 47),
(49, 'Alberto Mendoza', '6041000049', '3001000049', 'alberto.mendoza@email.com', 1, 1, 50),
(50, 'Rosa Cárdenas', '6041000050', '3001000050', 'rosa.cardenas@email.com', 1, 2, 49),
(51, 'Ramiro Ortega', '6041000051', '3001000051', 'ramiro.ortega@email.com', 1, 1, 52),
(52, 'Marta Silva', '6041000052', '3001000052', 'marta.silva@email.com', 1, 2, 51),
(53, 'Joaquín Navarro', '6041000053', '3001000053', 'joaquin.navarro@email.com', 1, 1, 54),
(54, 'Antonia Espinosa', '6041000054', '3001000054', 'antonia.espinosa@email.com', 1, 2, 53),
(55, 'Enrique Suárez', '6041000055', '3001000055', 'enrique.suarez@email.com', 1, 1, 56),
(56, 'Renata Arias', '6041000056', '3001000056', 'renata.arias@email.com', 1, 2, 55),
(57, 'Tomás Molina', '6041000057', '3001000057', 'tomas.molina@email.com', 1, 1, 58),
(58, 'Gabriela Ríos', '6041000058', '3001000058', 'gabriela.rios@email.com', 1, 2, 57),
(59, 'Samuel Pineda', '6041000059', '3001000059', 'samuel.pineda@email.com', 1, 1, 60),
(60, 'Valeria Cárdenas', '6041000060', '3001000060', 'valeria.cardenas@email.com', 1, 2, 59),
-- Presbíteros (1 por parroquia de la Visitación + 10 extra, total 14)
(61, 'Padre Álvaro Restrepo', '6041000061', '3001000061', 'alvaro.restrepo@email.com', 2, 1, NULL),
(62, 'Padre Jorge Giraldo', '6041000062', '3001000062', 'jorge.giraldo@email.com', 2, 1, NULL),
(63, 'Padre Luis Zapata', '6041000063', '3001000063', 'luis.zapata@email.com', 2, 1, NULL),
(64, 'Padre Mario Castaño', '6041000064', '3001000064', 'mario.castano@email.com', 2, 1, NULL),
(65, 'Padre Hernán Quintero', '6041000065', '3001000065', 'hernan.quintero@email.com', 2, 1, NULL),
(66, 'Padre Fabián Ospina', '6041000066', '3001000066', 'fabian.ospina@email.com', 2, 1, NULL),
(67, 'Padre Camilo Betancur', '6041000067', '3001000067', 'camilo.betancur@email.com', 2, 1, NULL),
(68, 'Padre Esteban Hoyos', '6041000068', '3001000068', 'esteban.hoyos@email.com', 2, 1, NULL),
(69, 'Padre Julián Restrepo', '6041000069', '3001000069', 'julian.restrepo@email.com', 2, 1, NULL),
(70, 'Padre Sergio Montoya', '6041000070', '3001000070', 'sergio.montoya@email.com', 2, 1, NULL),
(71, 'Padre Andrés Zapata', '6041000071', '3001000071', 'andres.zapata@email.com', 2, 1, NULL),
(72, 'Padre Diego Cárdenas', '6041000072', '3001000072', 'diego.cardenas@email.com', 2, 1, NULL),
(73, 'Padre Felipe Salazar', '6041000073', '3001000073', 'felipe.salazar@email.com', 2, 1, NULL),
(74, 'Padre Simón Ríos', '6041000074', '3001000074', 'simon.rios@email.com', 2, 1, NULL),
-- Seminaristas (10)
(75, 'Seminarista Juan Esteban', '6041000075', '3001000075', 'seminarista.juan@email.com', 4, 1, NULL),
(76, 'Seminarista Pablo López', '6041000076', '3001000076', 'seminarista.pablo@email.com', 4, 1, NULL),
(77, 'Seminarista Mateo Ruiz', '6041000077', '3001000077', 'seminarista.mateo@email.com', 4, 1, NULL),
(78, 'Seminarista Tomás Giraldo', '6041000078', '3001000078', 'seminarista.tomas@email.com', 4, 1, NULL),
(79, 'Seminarista Samuel Torres', '6041000079', '3001000079', 'seminarista.samuel@email.com', 4, 1, NULL),
(80, 'Seminarista Nicolás Ramírez', '6041000080', '3001000080', 'seminarista.nicolas@email.com', 4, 1, NULL),
(81, 'Seminarista David Castro', '6041000081', '3001000081', 'seminarista.david@email.com', 4, 1, NULL),
(82, 'Seminarista Daniel Salazar', '6041000082', '3001000082', 'seminarista.daniel@email.com', 4, 1, NULL),
(83, 'Seminarista Emiliano Peña', '6041000083', '3001000083', 'seminarista.emiliano@email.com', 4, 1, NULL),
(84, 'Seminarista Simón Vargas', '6041000084', '3001000084', 'seminarista.simon@email.com', 4, 1, NULL),
-- Monjas (10)
(85, 'Hermana Lucía Restrepo', '6041000085', '3001000085', 'hermana.lucia@email.com', 5, 2, NULL),
(86, 'Hermana Teresa Zapata', '6041000086', '3001000086', 'hermana.teresa@email.com', 5, 2, NULL),
(87, 'Hermana Rosa Castaño', '6041000087', '3001000087', 'hermana.rosa@email.com', 5, 2, NULL),
(88, 'Hermana Carmen Quintero', '6041000088', '3001000088', 'hermana.carmen@email.com', 5, 2, NULL),
(89, 'Hermana Gloria Ospina', '6041000089', '3001000089', 'hermana.gloria@email.com', 5, 2, NULL),
(90, 'Hermana Patricia Betancur', '6041000090', '3001000090', 'hermana.patricia@email.com', 5, 2, NULL),
(91, 'Hermana Sandra Hoyos', '6041000091', '3001000091', 'hermana.sandra@email.com', 5, 2, NULL),
(92, 'Hermana Adriana Restrepo', '6041000092', '3001000092', 'hermana.adriana@email.com', 5, 2, NULL),
(93, 'Hermana Marcela Montoya', '6041000093', '3001000093', 'hermana.marcela@email.com', 5, 2, NULL),
(94, 'Hermana Carolina Zapata', '6041000094', '3001000094', 'hermana.carolina@email.com', 5, 2, NULL),
-- Viudos y viudas (10)
(95, 'José Viudo', '6041000095', '3001000095', 'jose.viudo@email.com', 6, 1, NULL),
(96, 'Marta Viuda', '6041000096', '3001000096', 'marta.viuda@email.com', 6, 2, NULL),
(97, 'Alberto Viudo', '6041000097', '3001000097', 'alberto.viudo@email.com', 6, 1, NULL),
(98, 'Rosa Viuda', '6041000098', '3001000098', 'rosa.viuda@email.com', 6, 2, NULL),
(99, 'Enrique Viudo', '6041000099', '3001000099', 'enrique.viudo@email.com', 6, 1, NULL),
(100, 'Clara Viuda', '6041000100', '3001000100', 'clara.viuda@email.com', 6, 2, NULL),
(101, 'Ramiro Viudo', '6041000101', '3001000101', 'ramiro.viudo@email.com', 6, 1, NULL),
(102, 'Beatriz Viuda', '6041000102', '3001000102', 'beatriz.viuda@email.com', 6, 2, NULL),
(103, 'Gustavo Viudo', '6041000103', '3001000103', 'gustavo.viudo@email.com', 6, 1, NULL),
(104, 'Elena Viuda', '6041000104', '3001000104', 'elena.viuda@email.com', 6, 2, NULL),
-- Solteros y solteras (resto hasta 200, alternando género y carisma)
(105, 'Santiago Soltero', '6041000105', '3001000105', 'santiago.soltero@email.com', 7, 1, NULL),
(106, 'Valeria Soltera', '6041000106', '3001000106', 'valeria.soltera@email.com', 7, 2, NULL),
(107, 'Tomás Soltero', '6041000107', '3001000107', 'tomas.soltero@email.com', 7, 1, NULL),
(108, 'Isabella Soltera', '6041000108', '3001000108', 'isabella.soltera@email.com', 7, 2, NULL),
(109, 'Emilio Soltero', '6041000109', '3001000109', 'emilio.soltero@email.com', 7, 1, NULL),
(110, 'Mariana Soltera', '6041000110', '3001000110', 'mariana.soltera@email.com', 7, 2, NULL),
(111, 'Alejandro Soltero', '6041000111', '3001000111', 'alejandro.soltero@email.com', 7, 1, NULL),
(112, 'Juliana Soltera', '6041000112', '3001000112', 'juliana.soltera@email.com', 7, 2, NULL),
(113, 'Esteban Soltero', '6041000113', '3001000113', 'esteban.soltero@email.com', 7, 1, NULL),
(114, 'Daniela Soltera', '6041000114', '3001000114', 'daniela.soltera@email.com', 7, 2, NULL),
(115, 'Nicolás Soltero', '6041000115', '3001000115', 'nicolas.soltero@email.com', 7, 1, NULL),
(116, 'Sara Soltera', '6041000116', '3001000116', 'sara.soltera@email.com', 7, 2, NULL),
(117, 'Tomás Soltero', '6041000117', '3001000117', 'tomas2.soltero@email.com', 7, 1, NULL),
(118, 'Valentina Soltera', '6041000118', '3001000118', 'valentina2.soltera@email.com', 7, 2, NULL),
(119, 'Martín Soltero', '6041000119', '3001000119', 'martin.soltero@email.com', 7, 1, NULL),
(120, 'Camila Soltera', '6041000120', '3001000120', 'camila2.soltera@email.com', 7, 2, NULL),
(121, 'Samuel Soltero', '6041000121', '3001000121', 'samuel.soltero@email.com', 7, 1, NULL),
(122, 'Gabriela Soltera', '6041000122', '3001000122', 'gabriela2.soltera@email.com', 7, 2, NULL),
(123, 'Emilio Soltero', '6041000123', '3001000123', 'emilio2.soltero@email.com', 7, 1, NULL),
(124, 'Laura Soltera', '6041000124', '3001000124', 'laura2.soltera@email.com', 7, 2, NULL),
(125, 'Diego Soltero', '6041000125', '3001000125', 'diego.soltero@email.com', 7, 1, NULL),
(126, 'Isabella Soltera', '6041000126', '3001000126', 'isabella2.soltera@email.com', 7, 2, NULL),
(127, 'Mateo Soltero', '6041000127', '3001000127', 'mateo.soltero@email.com', 7, 1, NULL),
(128, 'Antonia Soltera', '6041000128', '3001000128', 'antonia.soltera@email.com', 7, 2, NULL),
(129, 'Lucas Soltero', '6041000129', '3001000129', 'lucas.soltero@email.com', 7, 1, NULL),
(130, 'Renata Soltera', '6041000130', '3001000130', 'renata.soltera@email.com', 7, 2, NULL),
(131, 'Andrés Soltero', '6041000131', '3001000131', 'andres.soltero@email.com', 7, 1, NULL),
(132, 'Valentina Soltera', '6041000132', '3001000132', 'valentina3.soltera@email.com', 7, 2, NULL),
(133, 'Felipe Soltero', '6041000133', '3001000133', 'felipe.soltero@email.com', 7, 1, NULL),
(134, 'María Soltera', '6041000134', '3001000134', 'maria3.soltera@email.com', 7, 2, NULL),
(135, 'Julián Soltero', '6041000135', '3001000135', 'julian2.soltero@email.com', 7, 1, NULL),
(136, 'Daniela Soltera', '6041000136', '3001000136', 'daniela2.soltera@email.com', 7, 2, NULL),
(137, 'Santiago Soltero', '6041000137', '3001000137', 'santiago2.soltero@email.com', 7, 1, NULL),
(138, 'Isabella Soltera', '6041000138', '3001000138', 'isabella3.soltera@email.com', 7, 2, NULL),
(139, 'Tomás Soltero', '6041000139', '3001000139', 'tomas3.soltero@email.com', 7, 1, NULL),
(140, 'Gabriela Soltera', '6041000140', '3001000140', 'gabriela3.soltera@email.com', 7, 2, NULL),
(141, 'Emilio Soltero', '6041000141', '3001000141', 'emilio3.soltero@email.com', 7, 1, NULL),
(142, 'Laura Soltera', '6041000142', '3001000142', 'laura2.soltera@email.com', 7, 2, NULL),
(143, 'Diego Soltero', '6041000143', '3001000143', 'diego.soltero@email.com', 7, 1, NULL),
(144, 'Isabella Soltera', '6041000144', '3001000144', 'isabella2.soltera@email.com', 7, 2, NULL),
(145, 'Mateo Soltero', '6041000145', '3001000145', 'mateo2.soltero@email.com', 7, 1, NULL),
(146, 'Sara Soltera', '6041000146', '3001000146', 'sara2.soltera@email.com', 7, 2, NULL),
(147, 'Joaquín Soltero', '6041000147', '3001000147', 'joaquin2.soltero@email.com', 7, 1, NULL),
(148, 'Camila Soltera', '6041000148', '3001000148', 'camila5.soltera@email.com', 7, 2, NULL),
(149, 'Sebastián Soltero', '6041000149', '3001000149', 'sebastian4.soltero@email.com', 7, 1, NULL),
(150, 'Mariana Soltera', '6041000150', '3001000150', 'mariana4.soltera@email.com', 7, 2, NULL),
(151, 'David Soltero', '6041000151', '3001000151', 'david4.soltero@email.com', 7, 1, NULL),
(152, 'Gabriela Soltera', '6041000152', '3001000152', 'gabriela8.soltera@email.com', 7, 2, NULL),
(153, 'Lucas Soltero', '6041000153', '3001000153', 'lucas4.soltero@email.com', 7, 1, NULL),
(154, 'Valeria Soltera', '6041000154', '3001000154', 'valeria3.soltera@email.com', 7, 2, NULL),
(155, 'Emiliano Soltero', '6041000155', '3001000155', 'emiliano2.soltero@email.com', 7, 1, NULL),
(156, 'Renata Soltera', '6041000156', '3001000156', 'renata4.soltera@email.com', 7, 2, NULL),
(157, 'Tomás Soltero', '6041000157', '3001000157', 'tomas5.soltero@email.com', 7, 1, NULL),
(158, 'Isabella Soltera', '6041000158', '3001000158', 'isabella5.soltera@email.com', 7, 2, NULL),
(159, 'Santiago Soltero', '6041000159', '3001000159', 'santiago4.soltero@email.com', 7, 1, NULL),
(160, 'María Soltera', '6041000160', '3001000160', 'maria5.soltera@email.com', 7, 2, NULL),
(161, 'Felipe Soltero', '6041000161', '3001000161', 'felipe3.soltero@email.com', 7, 1, NULL),
(162, 'Daniela Soltera', '6041000162', '3001000162', 'daniela4.soltera@email.com', 7, 2, NULL),
(163, 'Julián Soltero', '6041000163', '3001000163', 'julian4.soltero@email.com', 7, 1, NULL),
(164, 'Luciana Soltera', '6041000164', '3001000164', 'luciana4.soltera@email.com', 7, 2, NULL),
(165, 'Samuel Soltero', '6041000165', '3001000165', 'samuel4.soltero@email.com', 7, 1, NULL),
(166, 'Antonia Soltera', '6041000166', '3001000166', 'antonia4.soltera@email.com', 7, 2, NULL),
(167, 'Martín Soltero', '6041000167', '3001000167', 'martin4.soltero@email.com', 7, 1, NULL),
(168, 'Gabriela Soltera', '6041000168', '3001000168', 'gabriela7.soltera@email.com', 7, 2, NULL),
(169, 'Nicolás Soltero', '6041000169', '3001000169', 'nicolas4.soltero@email.com', 7, 1, NULL),
(170, 'Laura Soltera', '6041000170', '3001000170', 'laura5.soltera@email.com', 7, 2, NULL),
(171, 'Mateo Soltero', '6041000171', '3001000171', 'mateo4.soltero@email.com', 7, 1, NULL),
(172, 'Sara Soltera', '6041000172', '3001000172', 'sara4.soltera@email.com', 7, 2, NULL),
(173, 'Joaquín Soltero', '6041000173', '3001000173', 'joaquin4.soltero@email.com', 7, 1, NULL),
(174, 'Camila Soltera', '6041000174', '3001000174', 'camila5.soltera@email.com', 7, 2, NULL),
(175, 'Sebastián Soltero', '6041000175', '3001000175', 'sebastian4.soltero@email.com', 7, 1, NULL),
(176, 'Mariana Soltera', '6041000176', '3001000176', 'mariana4.soltera@email.com', 7, 2, NULL),
(177, 'David Soltero', '6041000177', '3001000177', 'david4.soltero@email.com', 7, 1, NULL),
(178, 'Gabriela Soltera', '6041000178', '3001000178', 'gabriela8.soltera@email.com', 7, 2, NULL),
(179, 'Lucas Soltero', '6041000179', '3001000179', 'lucas4.soltero@email.com', 7, 1, NULL),
(180, 'Pedro Viudo', '6041000180', '3001000180', 'pedro.viudo@email.com', 6, 1, NULL),
(181, 'Lucía Viuda', '6041000181', '3001000181', 'lucia2.viuda@email.com', 6, 2, NULL),
(182, 'Javier Viudo', '6041000182', '3001000182', 'javier.viudo@email.com', 6, 1, NULL),
(183, 'Marina Viuda', '6041000183', '3001000183', 'marina.viuda@email.com', 6, 2, NULL),
(184, 'Héctor Viudo', '6041000184', '3001000184', 'hector.viudo@email.com', 6, 1, NULL),
(185, 'Rosa Viuda', '6041000185', '3001000185', 'rosa2.viuda@email.com', 6, 2, NULL),
(186, 'Germán Viudo', '6041000186', '3001000186', 'german.viudo@email.com', 6, 1, NULL),
(187, 'Cecilia Viuda', '6041000187', '3001000187', 'cecilia.viuda@email.com', 6, 2, NULL),
(188, 'Alfonso Viudo', '6041000188', '3001000188', 'alfonso.viudo@email.com', 6, 1, NULL),
(189, 'Margarita Viuda', '6041000189', '3001000189', 'margarita.viuda@email.com', 6, 2, NULL),
(190, 'Raúl Viudo', '6041000190', '3001000190', 'raul.viudo@email.com', 6, 1, NULL),
(191, 'Elena Viuda', '6041000191', '3001000191', 'elena2.viuda@email.com', 6, 2, NULL),
(192, 'Fernando Viudo', '6041000192', '3001000192', 'fernando.viudo@email.com', 6, 1, NULL),
(193, 'Beatriz Viuda', '6041000193', '3001000193', 'beatriz2.viuda@email.com', 6, 2, NULL),
(194, 'Pablo Viudo', '6041000194', '3001000194', 'pablo.viudo@email.com', 6, 1, NULL),
(195, 'Gloria Viuda', '6041000195', '3001000195', 'gloria2.viuda@email.com', 6, 2, NULL),
(196, 'Rubén Viudo', '6041000196', '3001000196', 'ruben.viudo@email.com', 6, 1, NULL),
(197, 'Silvia Viuda', '6041000197', '3001000197', 'silvia.viuda@email.com', 6, 2, NULL),
(198, 'Mario Viudo', '6041000198', '3001000198', 'mario.viudo@email.com', 6, 1, NULL),
(199, 'Camila Viuda', '6041000199', '3001000199', 'camila.viuda@email.com', 6, 2, NULL),
(200, 'Jorge Viudo', '6041000200', '3001000200', 'jorge.viudo@email.com', 6, 1, NULL);

-- Communities
INSERT INTO communities (id, number, born_date, parish_id, born_brothers, actual_brothers, step_way_id, last_step_way_date, cathechist_team_id) VALUES
(1, '1', '2000-01-01', 1, 50, 50, 1, '2024-01-01', 1),
(2, '2', '2002-01-01', 1, 42, 42, 2, '2024-01-01', 2),
(3, '3', '2004-01-01', 1, 30, 30, 3, '2024-01-01', 3),
(4, '4', '2006-01-01', 1, 46, 46, 4, '2024-01-01', 4);

-- Teams (Responsables y Catequistas)
INSERT INTO teams (id, name, team_type_id, community_id) VALUES
  (1, 'Equipo Responsables Comunidad 1', 4, 1),
  (2, 'Equipo Catequistas 1 Comunidad 1', 3, 1),
  (3, 'Equipo Catequistas 2 Comunidad 1', 3, 1),
  (4, 'Equipo Responsables Comunidad 2', 4, 2),
  (5, 'Equipo Catequistas Comunidad 2', 3, 2),
  (6, 'Equipo Responsables Comunidad 3', 4, 3),
  (7, 'Equipo Catequistas Comunidad 3', 3, 3),
  (8, 'Equipo Responsables Comunidad 4', 4, 4),
  (9, 'Equipo Catequistas Comunidad 4', 3, 4);

-- ParishTeams
INSERT INTO parish_teams (id, parish_id, team_id) VALUES
  (1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4), (5, 1, 5), (6, 1, 6), (7, 1, 7), (8, 1, 8), (9, 1, 9);

-- Priests (presbíteros)
INSERT INTO priests (id, person_id, is_parish_priest, parish_id) VALUES
  (1, 61, TRUE, 1), (2, 62, FALSE, 1), (3, 63, FALSE, 1), (4, 64, FALSE, 1), (5, 65, FALSE, 1), (6, 66, FALSE, 1), (7, 67, FALSE, 1), (8, 68, FALSE, 1), (9, 69, FALSE, 1), (10, 70, FALSE, 1), (11, 71, FALSE, 1), (12, 72, FALSE, 1), (13, 73, FALSE, 1), (14, 74, FALSE, 1);

-- Brothers (hermanos de comunidad)
-- Asignación variada y cumpliendo reglas de composición de cada comunidad
-- Comunidad 1: 50 hermanos (10 matrimonios, 7 presbíteros, resto otros carismas)
-- Matrimonios: IDs 1,3,5,7,9,11,13,15,17,19 (hombres y sus esposas)
-- Presbíteros: IDs 61,63,65,67,69,71,73
-- Otros: solteros, monjas, seminaristas, viudos, seleccionados alternando
INSERT INTO brothers (id, person_id, community_id) VALUES
-- Matrimonios (hombres y esposas)
(1, 1, 1), (2, 2, 1), (3, 3, 1), (4, 4, 1), (5, 5, 1), (6, 6, 1), (7, 7, 1), (8, 8, 1), (9, 9, 1), (10, 10, 1),
(11, 11, 1), (12, 12, 1), (13, 13, 1), (14, 14, 1), (15, 15, 1), (16, 16, 1), (17, 17, 1), (18, 18, 1), (19, 19, 1), (20, 20, 1),
-- Presbíteros
(21, 61, 1), (22, 63, 1), (23, 65, 1), (24, 67, 1), (25, 69, 1), (26, 71, 1), (27, 73, 1),
-- Otros (alternando solteros, monjas, seminaristas, viudos)
(28, 105, 1), (29, 106, 1), (30, 85, 1), (31, 75, 1), (32, 95, 1),
(33, 107, 1), (34, 108, 1), (35, 86, 1), (36, 76, 1), (37, 96, 1),
(38, 109, 1), (39, 110, 1), (40, 87, 1), (41, 77, 1), (42, 97, 1),
(43, 111, 1), (44, 112, 1), (45, 88, 1), (46, 78, 1), (47, 98, 1),
(48, 113, 1), (49, 114, 1), (50, 89, 1);

-- Comunidad 2: 42 hermanos (7 matrimonios, 2 presbíteros, resto otros)
-- Matrimonios (hombres y esposas)
INSERT INTO brothers (id, person_id, community_id) VALUES
-- Matrimonios (hombres y esposas)
(51, 21, 2), (52, 22, 2), (53, 23, 2), (54, 24, 2), (55, 25, 2), (56, 26, 2), (57, 27, 2), (58, 28, 2), (59, 29, 2), (60, 30, 2),
(61, 31, 2), (62, 32, 2), (63, 33, 2), (64, 34, 2),
-- Presbíteros
(65, 62, 2), (66, 64, 2),
-- Otros (alternando solteros, monjas, seminaristas, viudos)
(67, 115, 2), (68, 116, 2), (69, 90, 2), (70, 79, 2), (71, 99, 2),
(72, 117, 2), (73, 118, 2), (74, 91, 2), (75, 80, 2), (76, 100, 2),
(77, 119, 2), (78, 120, 2), (79, 92, 2), (80, 81, 2), (81, 101, 2),
(82, 121, 2), (83, 122, 2), (84, 93, 2), (85, 82, 2), (86, 102, 2),
(87, 123, 2), (88, 124, 2), (89, 94, 2), (90, 83, 2), (91, 103, 2),
(92, 125, 2), (93, 126, 2);

-- Comunidad 3: 30 hermanos (5 matrimonios, resto otros)
INSERT INTO brothers (id, person_id, community_id) VALUES
-- Matrimonios (hombres y esposas)
(94, 35, 3), (95, 36, 3), (96, 37, 3), (97, 38, 3), (98, 39, 3), (99, 40, 3), (100, 41, 3), (101, 42, 3), (102, 43, 3), (103, 44, 3),
-- Otros (alternando solteros, monjas, seminaristas, viudos)
(104, 127, 3), (105, 128, 3), (106, 95, 3), (107, 84, 3), (108, 104, 3),
(109, 129, 3), (110, 130, 3), (111, 96, 3), (112, 85, 3), (113, 105, 3),
(114, 131, 3), (115, 132, 3), (116, 97, 3), (117, 86, 3), (118, 106, 3),
(119, 133, 3), (120, 134, 3), (121, 98, 3), (122, 87, 3), (123, 107, 3);

-- Comunidad 4: 78 hermanos (8 matrimonios, 1 presbítero, resto otros)
INSERT INTO brothers (id, person_id, community_id) VALUES
-- Matrimonios (hombres y esposas)
(124, 45, 4), (125, 46, 4), (126, 47, 4), (127, 48, 4), (128, 49, 4), (129, 50, 4), (130, 51, 4), (131, 52, 4), (132, 53, 4), (133, 54, 4),
(134, 55, 4), (135, 56, 4), (136, 57, 4), (137, 58, 4), (138, 59, 4), (139, 60, 4),
-- Presbíteros
(140, 66, 4),
-- Otros (solo PersonId no usados en otras comunidades y sin duplicados internos)
(141, 140, 4), (142, 141, 4), (143, 142, 4), (144, 143, 4), (145, 144, 4), (146, 145, 4), (147, 146, 4), (148, 147, 4),
(149, 148, 4), (150, 149, 4), (151, 150, 4), (152, 151, 4), (153, 152, 4), (154, 153, 4), (155, 154, 4), (156, 155, 4),
(157, 156, 4), (158, 157, 4), (159, 158, 4), (160, 159, 4), (161, 160, 4), (162, 161, 4), (163, 162, 4), (164, 163, 4),
(165, 164, 4), (166, 165, 4), (167, 166, 4), (168, 167, 4), (169, 168, 4), (170, 169, 4), (171, 170, 4), (172, 171, 4),
(173, 172, 4), (174, 173, 4), (175, 174, 4), (176, 175, 4), (177, 176, 4), (178, 177, 4), (179, 178, 4), (180, 179, 4),
(181, 180, 4), (182, 181, 4), (183, 182, 4), (184, 183, 4), (185, 184, 4), (186, 185, 4), (187, 186, 4), (188, 187, 4),
(189, 188, 4), (190, 189, 4), (191, 190, 4), (192, 191, 4), (193, 192, 4), (194, 193, 4), (195, 194, 4), (196, 195, 4),
(197, 196, 4), (198, 197, 4), (199, 198, 4), (200, 199, 4);

-- Belongs (pertenencia a equipos)
-- Ejemplo para Comunidad 1: Equipo de responsables (matrimonios 1,3,5 y soltera 76)
INSERT INTO belongs (id, person_id, community_id, team_id, is_responsible_for_the_team) VALUES
(1, 1, 1, 1, TRUE), (2, 3, 1, 1, FALSE), (3, 5, 1, 1, FALSE), (4, 76, 1, 1, FALSE),
-- Equipo catequistas 1 (matrimonios 1,5,9 y soltera 78)
(5, 1, 1, 2, TRUE), (6, 5, 1, 2, FALSE), (7, 9, 1, 2, FALSE), (8, 78, 1, 2, FALSE),
-- Equipo catequistas 2 (matrimonios 7,11 y solteros 79,81,83)
(9, 7, 1, 3, TRUE), (10, 11, 1, 3, FALSE), (11, 79, 1, 3, FALSE), (12, 81, 1, 3, FALSE), (13, 83, 1, 3, FALSE),
-- Comunidad 2: Equipo de responsables (matrimonios 21,23,25 y soltera 88)
(14, 21, 2, 4, TRUE), (15, 23, 2, 4, FALSE), (16, 25, 2, 4, FALSE), (17, 88, 2, 4, FALSE),
-- Equipo catequistas (matrimonios 21,25 y solteros 89,91)
(18, 21, 2, 5, TRUE), (19, 25, 2, 5, FALSE), (20, 89, 2, 5, FALSE), (21, 91, 2, 5, FALSE),
-- Comunidad 3: Equipo de responsables (matrimonios 35,37 y soltera 100)
(22, 35, 3, 6, TRUE), (23, 37, 3, 6, FALSE), (24, 100, 3, 6, FALSE),
-- Equipo catequistas (matrimonios 35,39 y solteros 101,103)
(25, 35, 3, 7, TRUE), (26, 39, 3, 7, FALSE), (27, 101, 3, 7, FALSE), (28, 103, 3, 7, FALSE),
-- Comunidad 4: Equipo de responsables (matrimonios 45,47 y soltera 128)
(29, 45, 4, 8, TRUE), (30, 47, 4, 8, FALSE), (31, 128, 4, 8, FALSE),
-- Equipo catequistas (matrimonios 45,49 y solteros 129,131)
(32, 45, 4, 9, TRUE), (33, 49, 4, 9, FALSE), (34, 129, 4, 9, FALSE), (35, 131, 4, 9, FALSE);

-- CommunityStepLog (registro de etapas)
INSERT INTO community_step_log (id, community_id, step_way_id, date_of_step, principal_catechist_name, outcome, notes) VALUES
  (1, 1, 1, '2024-01-01', 'Juan Pérez', TRUE, 'Inicio de comunidad'),
  (2, 2, 2, '2024-01-01', 'Carlos Rodríguez', TRUE, 'Inicio de comunidad'),
  (3, 3, 3, '2024-01-01', 'Pedro López', TRUE, 'Inicio de comunidad'),
  (4, 4, 4, '2024-01-01', 'Miguel Herrera', TRUE, 'Inicio de comunidad');

-- NOTA: Los datos aquí son de ejemplo. Para el archivo final, se debe expandir cada sección con los 200 personas, matrimonios, equipos y relaciones según las reglas del README.

-- El resto de los inserts (People, Communities, Teams, ParishTeams, Priests, Brothers, Belongs, CommunityStepLog) se generarán sintéticamente siguiendo las reglas del README y se agregarán aquí.
-- ...

-- ==============================================
-- FIX SEQUENCES AFTER MANUAL ID INSERTS
-- ==============================================
-- This section updates all sequences to match the actual maximum ID values in each table
-- This is necessary because when inserting with explicit IDs, PostgreSQL doesn't automatically update sequences

-- Countries sequence (max ID: 1)
SELECT setval('public.countries_id_seq', (SELECT MAX(id) FROM countries));

-- States sequence (max ID: 32)
SELECT setval('public.states_id_seq', (SELECT MAX(id) FROM states));

-- Cities sequence (max ID: 32)
SELECT setval('public.cities_id_seq', (SELECT MAX(id) FROM cities));

-- People sequence (max ID: 200)
SELECT setval('public.people_id_seq', (SELECT MAX(id) FROM people));

-- Parishes sequence (max ID: 20)
SELECT setval('public.parishes_id_seq', (SELECT MAX(id) FROM parishes));

-- StepWays sequence (max ID: 10)
SELECT setval('public.step_ways_id_seq', (SELECT MAX(id) FROM step_ways));

-- TeamTypes sequence (max ID: 4)
SELECT setval('public.team_types_id_seq', (SELECT MAX(id) FROM team_types));

-- Communities sequence (max ID: 4)
SELECT setval('public.communities_id_seq', (SELECT MAX(id) FROM communities));

-- Teams sequence (max ID: 9)
SELECT setval('public.teams_id_seq', (SELECT MAX(id) FROM teams));

-- ParishTeams sequence (max ID: 9)
SELECT setval('public.parish_teams_id_seq', (SELECT MAX(id) FROM parish_teams));

-- Priests sequence (max ID: 14)
SELECT setval('public.priests_id_seq', (SELECT MAX(id) FROM priests));

-- Brothers sequence (max ID: 200)
SELECT setval('public.brothers_id_seq', (SELECT MAX(id) FROM brothers));

-- Belongs sequence (max ID: 35)
SELECT setval('public.belongs_id_seq', (SELECT MAX(id) FROM belongs));

-- CommunityStepLog sequence (max ID: 4)
SELECT setval('public.community_step_log_id_seq', (SELECT MAX(id) FROM community_step_log));

-- Verify the sequences are updated correctly
SELECT 
    'countries' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM countries) as max_id
FROM countries_id_seq
UNION ALL
SELECT 
    'states' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM states) as max_id
FROM states_id_seq
UNION ALL
SELECT 
    'cities' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM cities) as max_id
FROM cities_id_seq
UNION ALL
SELECT 
    'people' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM people) as max_id
FROM people_id_seq
UNION ALL
SELECT 
    'parishes' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM parishes) as max_id
FROM parishes_id_seq
UNION ALL
SELECT 
    'step_ways' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM step_ways) as max_id
FROM step_ways_id_seq
UNION ALL
SELECT 
    'team_types' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM team_types) as max_id
FROM team_types_id_seq
UNION ALL
SELECT 
    'communities' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM communities) as max_id
FROM communities_id_seq
UNION ALL
SELECT 
    'teams' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM teams) as max_id
FROM teams_id_seq
UNION ALL
SELECT 
    'parish_teams' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM parish_teams) as max_id
FROM parish_teams_id_seq
UNION ALL
SELECT 
    'priests' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM priests) as max_id
FROM priests_id_seq
UNION ALL
SELECT 
    'brothers' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM brothers) as max_id
FROM brothers_id_seq
UNION ALL
SELECT 
    'belongs' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM belongs) as max_id
FROM belongs_id_seq
UNION ALL
SELECT 
    'community_step_log' as table_name, 
    last_value as sequence_value, 
    (SELECT MAX(id) FROM community_step_log) as max_id
FROM community_step_log_id_seq
ORDER BY table_name; 