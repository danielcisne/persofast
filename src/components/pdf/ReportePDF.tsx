import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import type { Solicitud } from '../../types';

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1f2937', lineHeight: 1.4 },

    // ==========================================
    // ESTILOS DE LA CARÁTULA
    // ==========================================
    dateRight: { textAlign: 'right', marginBottom: 20, fontSize: 11 },
    coverTopSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    coverLeftBlock: { width: '55%', flexDirection: 'column' },
    coverRightBlock: { width: '40%', alignItems: 'flex-end' },

    boldText: { fontWeight: 'bold', fontSize: 11 },
    normalText: { fontSize: 11 },
    asuntoText: { fontSize: 11, textAlign: 'right', marginTop: 10, marginBottom: 15 },

    summaryBox: {
        backgroundColor: '#f8fafc',
        borderLeft: '3 solid #7e22ce',
        padding: 10,
        borderRadius: 2,
        marginTop: 5
    },
    summaryRow: { flexDirection: 'row', marginBottom: 4 },
    summaryLabel: { width: 110, fontSize: 11, fontWeight: 'bold', color: '#334155' },
    summaryValue: { flex: 1, fontSize: 11, color: '#0f172a' },

    candidatePhoto: { width: 180, height: 210, objectFit: 'cover', border: '1 solid #374151' },
    photoPlaceholder: { width: 180, height: 210, backgroundColor: '#f3f4f6', border: '1 dashed #d1d5db', alignItems: 'center', justifyContent: 'center' },

    paragraph: {
        textAlign: 'justify',
        marginBottom: 12,
        fontSize: 11,
        lineHeight: 1.5,
        textIndent: 35
    },

    signatureBox: { marginTop: 50, textAlign: 'center' },
    signatureLine: { borderTop: '1 solid #000', width: 200, margin: '0 auto', paddingTop: 5 },

    // ==========================================
    // ESTILOS DE LAS TABLAS
    // ==========================================
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, borderBottom: '2 solid #7e22ce', paddingBottom: 10 },
    reportTitle: { fontSize: 14, fontWeight: 'bold', color: '#7e22ce', marginBottom: 4, letterSpacing: 1 },
    date: { fontSize: 8, color: '#6b7280' },
    sectionTitle: { fontSize: 11, fontWeight: 'bold', backgroundColor: '#f3f4f6', padding: 4, marginBottom: 8, textTransform: 'uppercase', color: '#374151' },
    table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#d1d5db', marginBottom: 15 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#d1d5db', minHeight: 20, alignItems: 'center' },
    tableColHeader: { width: '35%', backgroundColor: '#f9fafb', padding: 5, borderRightWidth: 1, borderRightColor: '#d1d5db', fontWeight: 'bold', fontSize: 9 },
    tableColValue: { width: '65%', padding: 5, fontSize: 9 },
    text: { fontSize: 9 },

    propertyPhoto: { width: '47%', height: 180, objectFit: 'cover', borderRadius: 4, marginBottom: 15, border: '1 solid #e5e7eb' }
});

const FilaTabla = ({ etiqueta, valor }: { etiqueta: string, valor: any }) => {
    const mostrarValor = valor !== undefined && valor !== null && String(valor).trim() !== '' && String(valor) !== 'undefined';
    return (
        <View style={styles.tableRow} wrap={false}>
            <View style={styles.tableColHeader}><Text style={styles.text}>{etiqueta}</Text></View>
            <View style={styles.tableColValue}><Text style={styles.text}>{mostrarValor ? String(valor) : 'No especificado'}</Text></View>
        </View>
    );
};

export default function ReportePDF({ solicitud }: { solicitud: Solicitud }) {
    const cap: any = solicitud.captura || {};

    const gen = cap.infoGenerica || {};
    const fam = cap.entornoFamiliar || {};
    const eco = cap.situacionEconomica || {};
    const edu = cap.educacionYAdicional || {};
    const viv = cap.vivienda || {};
    const mesa = cap.validacionLaboral || {};
    const fotos = cap.fotografias || {};

    const nombreCompleto = `${solicitud.candidato.nombre} ${solicitud.candidato.apellidoPaterno} ${solicitud.candidato.apellidoMaterno || ''}`.trim();
    const statusVal = solicitud.resultadoValidacion || 'Recomendable';
    const folioFormateado = String(solicitud.folio).padStart(4, '0');

    const gastos = eco.gastos || {};
    const totalEgresos = Object.values(gastos).reduce((acc: number, val: any) => acc + Number(val || 0), 0);

    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const hoy = new Date();
    const fechaFormateada = `${hoy.getDate()} de ${meses[hoy.getMonth()]} del ${hoy.getFullYear()}`;

    const nivelPresentacion = viv.decorado?.presentacion === '1' ? 'excelente' : viv.decorado?.presentacion === '2' ? 'regular' : 'mala';

    const fechaRecibido = solicitud.cita?.cuandoAgendo ? new Date(solicitud.cita.cuandoAgendo).toLocaleDateString() : 'No especificada';
    const fechaVisita = solicitud.cita?.fecha ? new Date(solicitud.cita.fecha + 'T00:00:00').toLocaleDateString() : 'No especificada';

    return (
        <Document>
            {/* ========================================================================= */}
            {/* 📄 PÁGINA 1: CARÁTULA                                                     */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>

                <Text style={styles.dateRight}>México, a {fechaFormateada}</Text>

                <View style={styles.coverTopSection}>
                    <View style={styles.coverLeftBlock}>
                        <Text style={styles.boldText}>{solicitud.empresa.toUpperCase()}</Text>
                        <Text style={styles.boldText}>ATENCIÓN: RECURSOS HUMANOS</Text>
                        <Text style={styles.boldText}>PRESENTE</Text>

                        <Text style={styles.asuntoText}>Asunto: Solicitud FOL-{folioFormateado}</Text>

                        <View style={styles.summaryBox}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Nombre completo</Text>
                                <Text style={styles.summaryValue}>: {nombreCompleto}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Status</Text>
                                <Text style={[
                                    styles.summaryValue,
                                    {
                                        color: statusVal === 'No Recomendable' ? '#dc2626' : statusVal === 'Con Reservas' ? '#d97706' : '#16a34a',
                                        fontWeight: 'bold'
                                    }
                                ]}>: {statusVal}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Puesto</Text>
                                <Text style={styles.summaryValue}>: {solicitud.puestoSolicitado || 'No especificado'}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Recibido</Text>
                                <Text style={styles.summaryValue}>: {fechaRecibido}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Visita domiciliaria</Text>
                                <Text style={styles.summaryValue}>: {fechaVisita}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.coverRightBlock}>
                        {fotos.candidato ? (
                            <Image src={fotos.candidato} style={styles.candidatePhoto} />
                        ) : (
                            <View style={styles.photoPlaceholder}>
                                <Text style={{ fontSize: 8, color: '#9ca3af' }}>Sin fotografía</Text>
                            </View>
                        )}
                    </View>
                </View>

                <Text style={styles.paragraph}>
                    El investigado {nombreCompleto}, es un {gen.sexo === 'Femenino' ? 'mujer' : 'hombre'} de {gen.edad || 'XX'} años de edad, de estado civil {gen.estadoCivil ? gen.estadoCivil.toLowerCase() : 'no especificado'}, que habita en su domicilio ubicado en: {solicitud.candidato.direccion || 'dirección no especificada'}{solicitud.candidato.celular ? `, Tel. ${solicitud.candidato.celular}` : ''}, desde hace {viv.caracteristicas?.tiempoResidenciaActual || 'tiempo no especificado'}.
                </Text>

                <Text style={styles.paragraph}>
                    El domicilio del investigado es un inmueble {viv.caracteristicas?.inmueble ? viv.caracteristicas.inmueble.toLowerCase() : 'no especificado'} y está ubicado en un sector {viv.caracteristicas?.sector ? viv.caracteristicas.sector.toLowerCase() : 'no especificado'}, el cual cuenta con los servicios básicos de la zona y se encuentra en {nivelPresentacion} estado de orden, limpieza y mantenimiento.
                </Text>

                <Text style={styles.paragraph}>
                    El investigado reporta contar con estudios máximos de {edu.ultimoGrado ? edu.ultimoGrado.toLowerCase() : 'no especificado'}.
                </Text>

                <Text style={styles.paragraph}>
                    Los egresos familiares reportados en este momento ascienden a un aproximado de ${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} mensuales, los cuales son cubiertos o apoyados mediante la aportación del solicitante de: {fam.aportacionSolicitante || 'no especificada'}.
                </Text>

                <Text style={styles.paragraph}>
                    En cuanto a las referencias personales corroboradas, se contactó a {mesa.ref1?.nombre || 'las referencias proporcionadas'}{mesa.ref2?.nombre ? ` y a ${mesa.ref2.nombre}` : ''}, quienes ratifican conocer al solicitante y lo recomiendan ampliamente, emitiendo una opinión {mesa.ref1?.opinion ? mesa.ref1.opinion.toLowerCase() : 'favorable'} sobre su persona.
                </Text>

                <Text style={styles.paragraph}>
                    En las referencias laborales, de la empresa {mesa.laboral1?.empresa || 'reportada'}, el jefe directo o recursos humanos nos comenta que el investigado {mesa.laboral1?.comentarios ? mesa.laboral1.comentarios.toLowerCase() : 'tuvo un desempeño adecuado durante su estancia'}.
                </Text>

                <View style={styles.signatureBox} wrap={false}>
                    <Text style={{ marginBottom: 40, fontSize: 11 }}>Atentamente,</Text>
                    <View style={styles.signatureLine}></View>
                    <Text style={styles.boldText}>Departamento de Integración</Text>
                    <Text style={styles.normalText}>Estudios Socioeconómicos</Text>
                </View>

            </Page>

            {/* ========================================================================= */}
            {/* 📄 PÁGINAS SIGUIENTES: TABLAS (BLINDADAS CONTRA CORTES)                   */}
            {/* ========================================================================= */}
            <Page size="A4" style={styles.page}>
                <View style={styles.header} fixed>
                    <View>
                        <Text style={styles.reportTitle}>DETALLE DEL ESTUDIO</Text>
                        <Text style={styles.date}>Folio: FOL-{folioFormateado}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{nombreCompleto}</Text>
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>I. Información Genérica</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Nombre Completo" valor={gen.nombreCompleto} />
                        <FilaTabla etiqueta="Lugar y Fecha de Nacimiento" valor={`${gen.lugarNacimiento || ''} / ${gen.fechaNacimiento || ''} (${gen.edad || ''} años)`} />
                        <FilaTabla etiqueta="Sexo y Estado Civil" valor={`${gen.sexo || ''} / ${gen.estadoCivil || ''}`} />
                        <FilaTabla etiqueta="¿Tiene Hijos?" valor={gen.hijos} />
                        <FilaTabla etiqueta="R.F.C. / C.U.R.P." valor={`${gen.rfc || ''} / ${gen.curp || ''}`} />
                        <FilaTabla etiqueta="NSS (Seguro Social)" valor={gen.imss} />
                        <FilaTabla etiqueta="INE / Licencia / Cartilla" valor={`${gen.noIne || ''} / ${gen.noLicencia || ''} / ${gen.cartilla || ''}`} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>II. Entorno Familiar</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Aportación del Solicitante" valor={fam.aportacionSolicitante} />
                        {fam.habitanDomicilio?.map((p: any, i: number) => (
                            <FilaTabla key={i} etiqueta={`Habitante ${i + 1}`} valor={`${p.nombre} (${p.parentesco}) | ${p.edad} años | ${p.ocupacion} | Aporta: ${p.aporta}`} />
                        ))}
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>III. Situación Económica (Gastos)</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Total de Egresos Mensuales" valor={`$${totalEgresos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} />
                        <FilaTabla etiqueta="Servicios Básicos (Luz, Agua, Tel, Gas)" valor={`Luz: $${eco.gastos?.luz || 0} | Agua: $${eco.gastos?.agua || 0} | Tel: $${eco.gastos?.telefono || 0} | Gas: $${eco.gastos?.gas || 0}`} />
                        <FilaTabla etiqueta="Alimentación y Transporte" valor={`Alimentos: $${eco.gastos?.alimentos || 0} | Transporte: $${eco.gastos?.transporte || 0}`} />
                        <FilaTabla etiqueta="Vivienda y Educación" valor={`Predial/Renta: $${eco.gastos?.predial || 0} | Colegiaturas: $${eco.gastos?.colegiaturas || 0}`} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>IIIa. Créditos Vigentes</Text>
                    <View style={styles.table}>
                        {(!eco.creditos || eco.creditos.length === 0) ? (
                            <FilaTabla etiqueta="Créditos Vigentes" valor="Ninguno reportado" />
                        ) : (
                            eco.creditos.map((c: any, i: number) => (
                                <FilaTabla 
                                    key={i} 
                                    etiqueta={`${c.institucion || 'Crédito'} (Cuenta: ${c.cuenta || 'S/N'})`} 
                                    valor={`Saldo: $${Number(c.saldo || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} | Abono mensual: $${Number(c.abonoMensual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
                                />
                            ))
                        )}
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>IIIb. Cuentas de Ahorro o Inversión</Text>
                    <View style={styles.table}>
                        {(!eco.cuentas || eco.cuentas.length === 0) ? (
                            <FilaTabla etiqueta="Cuentas" valor="Ninguna reportada" />
                        ) : (
                            eco.cuentas.map((c: any, i: number) => (
                                <FilaTabla 
                                    key={i} 
                                    etiqueta={`${c.institucion || 'Cuenta'} (Cuenta: ${c.cuenta || 'S/N'})`} 
                                    valor={`Saldo: $${Number(c.saldo || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} | Rendimiento mensual: $${Number(c.rendimientoMensual || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} 
                                />
                            ))
                        )}
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>IV. Educación y Datos Extra</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Último Grado de Estudios" valor={edu.ultimoGrado} />
                        <FilaTabla etiqueta="Salud (Enfermedades / Cirugías)" valor={`${edu.enfermedades || 'Ninguna'} / ${edu.cirugias || 'Ninguna'}`} />
                        <FilaTabla etiqueta="Hábitos (Fuma / Bebe)" valor={`${edu.fuma || 'No'} / ${edu.bebe || 'No'}`} />
                        <FilaTabla etiqueta="Sindicato" valor={edu.sindicato} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>V. Vivienda</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Externa (Tipo / Construcción)" valor={`${viv.externa?.tipo || ''} / ${viv.externa?.construccion || ''}`} />
                        <FilaTabla etiqueta="Distribución Interna (Detalle)" valor={viv.externa?.distribucionInterna} />
                        <FilaTabla etiqueta="Distribución Externa" valor={viv.externa?.distribucion} />
                        <FilaTabla etiqueta="Distribución Interna (Habitaciones)" valor={`${viv.interna?.recamaras || 0} Recámaras, ${viv.interna?.banos || 0} Baños`} />
                        <FilaTabla etiqueta="Características del Inmueble" valor={`${viv.caracteristicas?.inmueble || ''} a nombre de ${viv.caracteristicas?.inmuebleNombre || 'N/A'}`} />
                        <FilaTabla etiqueta="Tiempo de Residencia" valor={viv.caracteristicas?.tiempoResidenciaActual} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>VI. Antecedentes Laborales Corroborados</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta="Empresa Reportada" valor={mesa.laboral1?.empresa} />
                        <FilaTabla etiqueta="Periodo Corroborado" valor={`${mesa.laboral1?.fechaIngreso || ''} a ${mesa.laboral1?.fechaSalida || ''}`} />
                        <FilaTabla etiqueta="Puesto Inicial / Final" valor={`${mesa.laboral1?.puestoInicial || ''} / ${mesa.laboral1?.puestoFinal || ''}`} />
                        <FilaTabla etiqueta="Jefe Inmediato" valor={mesa.laboral1?.jefe} />
                        <FilaTabla etiqueta="Teléfono Jefe / Whatsapp" valor={`${mesa.laboral1?.telefonoJefe || ''} / ${mesa.laboral1?.whatsapp || ''}`} />
                        <FilaTabla etiqueta="Correo Electrónico Jefe" valor={mesa.laboral1?.correo} />
                        <FilaTabla etiqueta="¿Lo admitirían nuevamente?" valor={mesa.laboral1?.loAdmitirian} />
                        <FilaTabla etiqueta="Comentarios de RH" valor={mesa.laboral1?.comentarios} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>VII. Referencias Personales Corroboradas</Text>
                    <View style={styles.table}>
                        <FilaTabla etiqueta={`Ref 1: ${mesa.ref1?.nombre || 'No capturada'}`} valor={`Tel: ${mesa.ref1?.telefono || '-'} | Opinión: ${mesa.ref1?.opinion || '-'}`} />
                        <FilaTabla etiqueta={`Ref 2: ${mesa.ref2?.nombre || 'No capturada'}`} valor={`Tel: ${mesa.ref2?.telefono || '-'} | Opinión: ${mesa.ref2?.opinion || '-'}`} />
                        <FilaTabla etiqueta={`Ref 3: ${mesa.ref3?.nombre || 'No capturada'}`} valor={`Tel: ${mesa.ref3?.telefono || '-'} | Opinión: ${mesa.ref3?.opinion || '-'}`} />
                    </View>
                </View>

                <View wrap={false}>
                    <Text style={styles.sectionTitle}>VIII. Anexo Fotográfico del Inmueble</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 }}>
                        {fotos.fachada && <Image src={fotos.fachada} style={styles.propertyPhoto} />}
                        {fotos.calleIzquierda && <Image src={fotos.calleIzquierda} style={styles.propertyPhoto} />}
                        {fotos.calleDerecha && <Image src={fotos.calleDerecha} style={styles.propertyPhoto} />}
                        {fotos.interiorSala && <Image src={fotos.interiorSala} style={styles.propertyPhoto} />}
                        {fotos.interiorCocina && <Image src={fotos.interiorCocina} style={styles.propertyPhoto} />}
                        {fotos.interiorRecamara && <Image src={fotos.interiorRecamara} style={styles.propertyPhoto} />}
                    </View>
                </View>
            </Page>
        </Document>
    );
}
