const { getDatabase } = require('./backend/database');
const db = getDatabase();

['cargas','abastecimentos','descontos_motorista','preferencias_motorista','rotas_atribuicao','rotas_itinerario','rotas','postos_combustivel','caminhoes','motoristas','solicitacoes'].forEach(t => db.exec(`DELETE FROM ${t}`));

// MOTORISTAS
const insM = db.prepare('INSERT INTO motoristas (nome,email,telefone,salario_fixo,carta,observacoes) VALUES (?,?,?,?,?,?)');
const m1=insM.run('António Silva','antonio@email.com','+351 912 345 678',1200,'C+E','15 anos, rotas França-Portugal');
const m2=insM.run('Carlos Pereira','carlos@email.com','+351 923 456 789',1150,'C+E','Prefere rotas FR/BE para PT');
const m3=insM.run('Manuel Costa','manuel@email.com','+351 934 567 890',1100,'C+E','6 meses, boas referências');
const m4=insM.run('João Martins','joao@email.com','+351 945 678 901',1250,'C+E','Especialista transporte viaturas');
const m5=insM.run('Ricardo Santos','ricardo@email.com','+351 956 789 012',1100,'CE','Rotas ES-PT, entregas rápidas');
const mids=[m1.lastInsertRowid,m2.lastInsertRowid,m3.lastInsertRowid,m4.lastInsertRowid,m5.lastInsertRowid];

// CAMIÕES
const insC = db.prepare('INSERT INTO caminhoes (placa,marca,modelo,ano,capacidade_kg,cor,km_atuais) VALUES (?,?,?,?,?,?,?)');
const c1=insC.run('AB-12-34','Mercedes-Benz','Actros 1845',2022,18000,'Branco',142500);
const c2=insC.run('CD-56-78','Scania','R460',2023,20000,'Azul',98700);
const c3=insC.run('EF-90-12','Volvo','FH460',2021,18000,'Vermelho',189300);
const c4=insC.run('GH-34-56','DAF','XF530',2023,22000,'Branco',76500);
const c5=insC.run('IJ-78-90','MAN','TGX 18.510',2022,18000,'Cinzento',134200);
const c6=insC.run('KL-01-23','Mercedes-Benz','Actros 1853',2024,18500,'Preto',42300);
const cids=[c1.lastInsertRowid,c2.lastInsertRowid,c3.lastInsertRowid,c4.lastInsertRowid,c5.lastInsertRowid,c6.lastInsertRowid];

// POSTOS com email/site
const insP = db.prepare('INSERT INTO postos_combustivel (nome,localizacao,pais,empresa,latitude,longitude,telefone,email,site) VALUES (?,?,?,?,?,?,?,?,?)');
// PT
insP.run('IDS Lisboa','Lisboa, Av. Infante D. Henrique','PT','IDS',38.7369,-9.1368,'+351 218 310 000','lisboa@ids.pt','www.ids.pt');
insP.run('Repsol Porto','Porto, Estrada da Circunvalação','PT','Repsol',41.1616,-8.6441,'+351 229 993 300','porto@repsol.pt','www.repsol.pt');
// ES
insP.run('DKV Vigo','Vigo, A-55 km 12','ES','DKV',42.1995,-8.7054,'+34 986 267 800','vigo@dkv.eus','www.dkv.eus');
insP.run('Repsol Madrid','Madrid, A-4 km 15','ES','Repsol',40.3531,-3.6672,'+34 914 685 200','madrid@repsol.es','www.repsol.es');
insP.run('IDS Bilbau','Bilbau, AP-68 km 16','ES','IDS',43.2868,-2.9446,'+34 944 531 100','bilbau@ids.es','www.ids.es');
insP.run('Repsol Badajoz','Badajoz, A-5 km 398','ES','Repsol',38.8804,-6.9445,'+34 924 101 200','badajoz@repsol.es','www.repsol.es');
insP.run('DKV Burgos','Burgos, A-1 km 234','ES','DKV',42.3404,-3.7046,'+34 947 205 800','burgos@dkv.es','www.dkv.es');
// FR
insP.run('IDS Bordéus','Bordéus, A-63 km 5','FR','IDS',44.8178,-0.5792,'+33 557 193 400','bordeaux@ids.fr','www.ids.fr');
insP.run('Repsol Toulouse','Toulouse, A-61 km 18','FR','Repsol',43.5983,1.4490,'+33 561 434 500','toulouse@repsol.fr','www.repsol.fr');
insP.run('DKV Paris','Paris, A-10 km 12','FR','DKV',48.7315,2.2855,'+33 169 013 900','paris@dkv.fr','www.dkv.fr');
insP.run('IDS Tours','Tours, A-10 km 210','FR','IDS',47.3682,0.6898,'+33 247 501 200','tours@ids.fr','www.ids.fr');
insP.run('Repsol Lyon','Lyon, A-6 km 14','FR','Repsol',45.7574,4.8758,'+33 478 226 700','lyon@repsol.fr','www.repsol.fr');
insP.run('DKV Le Mans','Le Mans, A-11 km 154','FR','DKV',48.0043,0.1963,'+33 243 842 500','lemans@dkv.fr','www.dkv.fr');
// BE
insP.run('IDS Bruxelas','Bruxelas, E-40 km 18','BE','IDS',50.8496,4.3347,'+32 224 183 400','bruxelas@ids.be','www.ids.be');
insP.run('DKV Antuérpia','Antuérpia, E-19 km 25','BE','DKV',51.2194,4.4025,'+32 320 594 600','antuerpia@dkv.be','www.dkv.be');
// NL
insP.run('DKV Roterdão','Roterdão, A-16 km 20','NL','DKV',51.8851,4.4667,'+31 102 841 200','rotterdam@dkv.nl','www.dkv.nl');
insP.run('IDS Eindhoven','Eindhoven, A-2 km 115','NL','IDS',51.4416,5.4697,'+31 402 375 800','eindhoven@ids.nl','www.ids.nl');

// PREFERÊNCIAS
const insPref = db.prepare('INSERT INTO preferencias_motorista (motorista_id,tipo,descricao,prioridade) VALUES (?,?,?,?)');
insPref.run(m2.lastInsertRowid,'rota','Rotas FR/BE para PT',1);
insPref.run(m2.lastInsertRowid,'posto','Repsol Vigo - café',2);
insPref.run(m4.lastInsertRowid,'horario','Sair às 5h',1);
insPref.run(m4.lastInsertRowid,'descanso','Área com chuveiro e refeição',2);
insPref.run(m5.lastInsertRowid,'rota','Apenas ES-PT',1);
insPref.run(m1.lastInsertRowid,'posto','Sempre IDS (desconto)',1);

// ROTAS
const insR = db.prepare('INSERT INTO rotas (nome,origem,destino,distancia_km,pais_origem,pais_destino,data_saida,data_chegada_prevista,status,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?)');
const insA = db.prepare('INSERT INTO rotas_atribuicao (rota_id,motorista_id,caminhao_id,km_rodados,valor_adiantamento,status) VALUES (?,?,?,?,?,?)');
const insG = db.prepare('INSERT INTO cargas (rota_id,tipo_veiculo,marca,modelo,matricula,proprietario,valor_declarado) VALUES (?,?,?,?,?,?,?)');

// R1: Bruxelas→Porto CONCLUÍDA
let r=insR.run('Bruxelas → Porto','Bruxelas','Porto',1850,'BE','PT','2026-06-20','2026-06-22','concluida','4 veículos usados');
let ra=insA.run(r.lastInsertRowid,m4.lastInsertRowid,c4.lastInsertRowid,1845,250,'concluido');
insG.run(r.lastInsertRowid,'SUV','BMW','X5','BE-123-AB','Stand Car Bruxelas',45000);
insG.run(r.lastInsertRowid,'SUV','BMW','X3','BE-456-CD','Stand Car Bruxelas',38000);
insG.run(r.lastInsertRowid,'Sedan','Audi','A4','BE-789-EF','Stand Car Bruxelas',32000);
insG.run(r.lastInsertRowid,'Citadino','VW','Golf','BE-012-GH','Stand Car Bruxelas',25000);

// R2: Paris→Lisboa CONCLUÍDA
r=insR.run('Paris → Lisboa','Paris','Lisboa',1720,'FR','PT','2026-06-22','2026-06-24','concluida','3 veículos comerciais');
ra=insA.run(r.lastInsertRowid,m2.lastInsertRowid,c2.lastInsertRowid,1710,200,'concluido');
insG.run(r.lastInsertRowid,'Comercial','Renault','Master','FR-345-XY','Groupe Auto Paris',28000);
insG.run(r.lastInsertRowid,'Comercial','Citroën','Jumpy','FR-678-ZZ','Groupe Auto Paris',26000);
insG.run(r.lastInsertRowid,'SUV','Peugeot','3008','FR-901-AA','Groupe Auto Paris',35000);

// R3: Lyon→Porto CONCLUÍDA
r=insR.run('Lyon → Porto','Lyon','Porto',1450,'FR','PT','2026-06-24','2026-06-26','concluida','2 viaturas luxo');
ra=insA.run(r.lastInsertRowid,m1.lastInsertRowid,c1.lastInsertRowid,1440,220,'concluido');
insG.run(r.lastInsertRowid,'Desportivo','Porsche','Cayenne','FR-111-BB','Lyon Auto Luxe',85000);
insG.run(r.lastInsertRowid,'Berline','Mercedes-Benz','Classe E','FR-222-CC','Lyon Auto Luxe',62000);

// R4: Roterdão→Lisboa CONCLUÍDA
r=insR.run('Roterdão → Lisboa','Roterdão','Lisboa',1950,'NL','PT','2026-06-25','2026-06-27','concluida','5 veículos');
ra=insA.run(r.lastInsertRowid,m2.lastInsertRowid,c3.lastInsertRowid,1935,300,'concluido');
insG.run(r.lastInsertRowid,'SUV','Volvo','XC60','NL-77-DD','Auto Rotterdam',48000);
insG.run(r.lastInsertRowid,'Familiar','Toyota','Corolla Touring','NL-88-EE','Auto Rotterdam',27000);
insG.run(r.lastInsertRowid,'Citadino','Ford','Fiesta','NL-99-FF','Auto Rotterdam',18000);
insG.run(r.lastInsertRowid,'SUV','Kia','Sportage','NL-10-GG','Auto Rotterdam',32000);
insG.run(r.lastInsertRowid,'Pickup','Ford','Ranger','NL-11-HH','Auto Rotterdam',42000);

// R5: Barcelona→Porto CONCLUÍDA
r=insR.run('Barcelona → Porto','Barcelona','Porto',1050,'ES','PT','2026-06-26','2026-06-27','concluida','3 veículos');
ra=insA.run(r.lastInsertRowid,m5.lastInsertRowid,c5.lastInsertRowid,1040,120,'concluido');
insG.run(r.lastInsertRowid,'SUV','Seat','Tarraco','ES-222-JK','Barcelona Motor',36000);
insG.run(r.lastInsertRowid,'Citadino','Renault','Clio','ES-333-LM','Barcelona Motor',16000);
insG.run(r.lastInsertRowid,'Desportivo','Cupra','Born','ES-444-NP','Barcelona Motor',38000);

// R6: Bruxelas→Porto EM ANDAMENTO
r=insR.run('Bruxelas → Porto (2)','Bruxelas','Porto',1850,'BE','PT','2026-06-28','2026-06-30','em_andamento','Urgente 3 veículos');
ra=insA.run(r.lastInsertRowid,m1.lastInsertRowid,c4.lastInsertRowid,650,250,'em_rota');
insG.run(r.lastInsertRowid,'SUV','Audi','Q5','BE-555-QR','Auto Centre Bruxelas',52000);
insG.run(r.lastInsertRowid,'Eletrico','Tesla','Model 3','BE-666-ST','Auto Centre Bruxelas',45000);
insG.run(r.lastInsertRowid,'Berline','BMW','Série 3','BE-777-UV','Auto Centre Bruxelas',40000);

// R7: Paris→Lisboa PLANEJADA
r=insR.run('Paris → Lisboa (2)','Paris','Lisboa',1720,'FR','PT','2026-06-29','2026-07-01','planejada','4 veículos concessionária');
ra=insA.run(r.lastInsertRowid,m3.lastInsertRowid,c2.lastInsertRowid,0,0,'pendente');
insG.run(r.lastInsertRowid,'SUV','Peugeot','5008','FR-888-WX','Concessionária França',40000);
insG.run(r.lastInsertRowid,'Citadino','Renault','Captur','FR-999-YZ','Concessionária França',22000);
insG.run(r.lastInsertRowid,'Comercial','Fiat','Ducato','FR-000-AB','Concessionária França',33000);
insG.run(r.lastInsertRowid,'Eletrico','Renault','Megane E-Tech','FR-111-CD','Concessionária França',38000);

// R8: Madrid→Porto PLANEJADA
r=insR.run('Madrid → Porto','Madrid','Porto',635,'ES','PT','2026-06-30','2026-07-01','planejada','2 veículos entrega rápida');
ra=insA.run(r.lastInsertRowid,m5.lastInsertRowid,c6.lastInsertRowid,0,0,'pendente');
insG.run(r.lastInsertRowid,'SUV','Toyota','RAV4','ES-222-EF','Auto Madrid',38000);
insG.run(r.lastInsertRowid,'Citadino','Dacia','Sandero','ES-333-GH','Auto Madrid',14000);

// DESCONTOS
const insD = db.prepare('INSERT INTO descontos_motorista (motorista_id,valor,motivo) VALUES (?,?,?)');
insD.run(m2.lastInsertRowid,50,'Adiantamento extra refeições');
insD.run(m2.lastInsertRowid,35,'Via Verde pessoal');
insD.run(m4.lastInsertRowid,75,'Adiantamento vencimento');
insD.run(m5.lastInsertRowid,30,'Multa excesso velocidade');

// ABASTECIMENTOS
const insB = db.prepare('INSERT INTO abastecimentos (atribuicao_id,posto_id,litros,valor_total,tipo_combustivel) VALUES (?,?,?,?,?)');
const atribs = db.prepare('SELECT id FROM rotas_atribuicao').all();
// R1: IDS Bruxelas(15)+DKV Paris(11)+DKV Vigo(3)
insB.run(atribs[0].id,15,140,231,'diesel');insB.run(atribs[0].id,10,120,198,'diesel');insB.run(atribs[0].id,3,100,165,'diesel');
// R2: DKV Paris(10)+Repsol Lyon(13)+IDS Bordéus(8)
insB.run(atribs[1].id,10,180,297,'diesel');insB.run(atribs[1].id,13,100,165,'diesel');insB.run(atribs[1].id,8,60,99,'diesel');
// R5: Repsol Badajoz(6)+DKV Vigo(3)
insB.run(atribs[4].id,6,120,198,'diesel');insB.run(atribs[4].id,3,60,99,'diesel');
// R6: DKV Antuérpia(16)+IDS Bordéus(8)
insB.run(atribs[5].id,16,100,165,'diesel');insB.run(atribs[5].id,8,80,132,'diesel');

// SOLICITAÇÕES
const insS = db.prepare('INSERT INTO solicitacoes (cliente,email,telefone,origem,destino,pais_origem,pais_destino,tipo_veiculo,quantidade,valor_estimado,urgencia,status,observacoes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
insS.run('Stand Auto Alvalade','pedro@autoalvalade.pt','+351 916 234 567','Paris','Lisboa','FR','PT','SUV',2,75000,'normal','pendente','Cliente habitual, BMW X3 e X5');
insS.run('Import Car Lda','info@importcar.pt','+351 962 111 222','Bruxelas','Porto','BE','PT','Todo-o-terreno',1,48000,'alta','pendente','Range Rover Sport 2025');
insS.run('Auto Europa SA','europa@autoeuropa.com','+351 910 555 333','Roterdão','Lisboa','NL','PT','Comercial',4,95000,'normal','pendente','4 carrinhas VW Transporter');
insS.run('Concessionária Sul','sul@concessionaria.pt','+351 936 777 888','Madrid','Porto','ES','PT','Sedan',2,55000,'urgente','analise','Mercedes Classe C, entrega esta semana');
insS.run('Luxury Cars Portugal','luxury@luxurycars.pt','+351 921 444 555','Lyon','Lisboa','FR','PT','Desportivo',1,90000,'baixa','pendente','Ferrari Roma, precisa seguro especial');

console.log('✅ FRET v2 completo! Motoristas:5 Camiões:6 Postos:17 Rotas:8 Solicitações:5');