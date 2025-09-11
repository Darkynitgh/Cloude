

Vue.createApp({
    data() {
        return {
            array: {
                anioMes: [],
                ventas: [],
                distribuidores: [],
                registros: []
            },
            ddl: {
                distribuidor: '0',
            },
            show: {
                capturar: true, 
                cancelar: false,
                guardar: false
            },
            cliente: '',
            idSemestre: 0,
            distribuidorActual: '',
            codigoSage: '',
            nombre: '',
        }
    },
    methods: {
        getDatos() {
            setLoader();
            axios.post(`${url}RedOsel/GetDatosVentasMayoristas`, {
                idUsuario: mainApp.idUsuario
            }).then(res => {
                let response = res.data;


                this.nombre = response.cliente.cliente;

                if (response.detallePartidasDistribuidores.length > 0) {
                    this.codigoSage = response.detallePartidasDistribuidores[0].cveMayorista;
                    this.ddl.distribuidor = response.detallePartidasPrimerDistribuidor[0].cveDistribuidor;
                } else {
                    this.codigoSage = mainApp.auxSage;
                    this.ddl.distribuidor = '0';
                }
            
                this.cliente = this.codigoSage + ' - ' + response.cliente.cliente;
                this.array.distribuidores = response.distribuidoresIndirectos;
                this.array.anioMes = this.generateYearMonthRange(response.semestres.anioInicial, response.semestres.mesInicial, response.semestres.anioFinal, response.semestres.mesFinal);


                this.idSemestre = response.semestres.id;
             

                if (response.hasOwnProperty('response')) {
                    if (response.detallePartidasPrimerDistribuidor.length > 0) {
                        //response.detallePartidasPrimerDistribuidor.forEach(i => {
                        //    let item = this.array.anioMes.find(j => j.anio === i.anio && j.mes === i.mes);
                        //    if (item) {
                        //        item.importe = this.formatNumber(i.venta);                      
                        //    }                     
                        //});

                        //this.show.capturar = false;
                        //this.show.cancelar = true;
                        //this.show.guardar = true;
                    }
                }
           

                if (response.detallePartidasDistribuidores.length > 0) {
                    this.array.ventas = response.detallePartidasDistribuidores;
                    this.array.ventas = this.sortData(this.array.ventas);
                }

                //var distribuidor = this.array.distribuidores.find(i => i.cliente.trim() === this.ddl.distribuidor.trim());
                //this.distribuidorActual = `<b>Distribuidor Indirecto</b>:&nbsp;${distribuidor.cliente} - ${distribuidor.nombre}`;

                this.array.anioMes.forEach(i => i.edita = true);


                setLoader('hide');
            }).catch(err => validError(err));
        },
        cancelarSeleccion() {
            this.array.anioMes.forEach(i => {
                i.importe = '';
                i.edita = false;
            });

            this.array.registros = [];
            this.distribuidorActual = '';
            this.show.capturar = true;
            this.show.cancelar = false;
            this.show.guardar = false;
        },
        getCapturasDistribuidor() {
            if (this.ddl.distribuidor.toString() !== '0') {
                this.array.ventas = [];
                this.array.registros = [];
                setLoader();

                axios.post(`${url}RedOsel/GetCapturasDistribuidor`, {
                    id_usuario: mainApp.idUsuario,
                    idSemestre: this.idSemestre,
                    codigoSage: this.codigoSage,
                    claveDistribuidor: this.ddl.distribuidor
                }).then(res => {
                    const response = res.data;

                    this.array.anioMes.forEach(i => {
                        i.importe = '';
                        i.disabled = false;

                    });

                    this.array.registros = response.detalleDistribuidor;
                    if (response.detalleDistribuidor.length === 0) {
                        alerts.info('El distribuidor no tiene capturas')
                    } else {
               
                        response.detalleDistribuidor.forEach(i => {
                            let item = this.array.anioMes.find(j => j.anio === i.anio && j.mes === i.mes);
                            if (item) {
                                item.importe = this.formatNumber(i.venta);
                            }
                        });
                    }
               

                    var distribuidor = this.array.distribuidores.find(i => i.cliente.trim() === this.ddl.distribuidor.trim());
                    this.distribuidorActual = `<b>Distribuidor Indirecto</b>:&nbsp;${distribuidor.cliente} - ${distribuidor.nombre}`;

                    this.show.capturar = false;
                    this.show.cancelar = true;
                    this.show.guardar = true;

                    if (response.detallePartidasDistribuidores.length !== 0) {
                        this.array.ventas = this.sortData(response.detallePartidasDistribuidores);
                    }

                    setLoader('hide');
                }).catch(err => validError(err));
            } else {
                alerts.error('Elija un distribuidor');
            }            
        },
        getCapturasDistribuidores() {
            this.array.ventas = [];
            setLoader();
                
            axios.post(`${url}RedOsel/GetCapturasDistribuidores`, {
                idSemestre: this.idSemestre,
                codigoSage: this.codigoSage
            }).then(res => {
                const response = res.data;

                if (response.length > 0) {
                    this.array.ventas = this.sortData(response);
                }

                setLoader('hide');
            }).catch(err => validError(err));
        },
        borrar(item) {
            item.importe = '';
        },
        async capturasDistribuidorInserta() {
            let pass = true;
            if (Number(this.unFormat(this.totalCapturado)) === 0 && this.array.registros.length > 0) {
                pass = await alerts.confirm(`<p class='p-0 m-0 text-center'>No se ingresó ninguna información, se borrará registros con $0.00<br/>¿Desea continuar?</p>`)
            } 
            if (this.array.registros.length === 0 && Number(this.unFormat(this.totalCapturado)) === 0) {
                alerts.info('No hay registros para borrar');
                return;
            }

            if (pass) {
                for (var i of this.array.anioMes) {
                    try {
                        await this.insertaVentas(i.anioMes, this.unFormat(i.importe)); // ✅ Wait for completion
                        i.exitoso = true;
                    } catch (err) {
                        i.exitoso = false;
                        i.error = err;
                    }
                }
                this.getCapturasDistribuidores();
            }          
        },
        insertaVentas(anioMes, venta) {
            return new Promise((success, fail) => {
                setLoader();
                axios.post(`${url}RedOsel/CapturasDistribuidorInserta`, {
                    idSemestre: this.idSemestre,
                    codigoSage: this.codigoSage,
                    claveDistribuidor: this.ddl.distribuidor,
                    anioMes: anioMes,
                    venta: venta
                }).then(res => {
                    success('');
                }).catch(err => {
                    fail(err);
                })
            });
        },
        async eliminaVenta(item) {
            let res = await alerts.confirm(`<p class="p-0 m-0 text-center">¿Está seguro de eliminar el registro de ${item.cveDistribuidor} - ${item.nombre.replace('-', '') } por ${this.formatNumber(item.venta)} del ${item.mes} - ${item.anio}`)
            if (res) {
                setLoader();
                axios.post(`${url}RedOsel/CapturasDistribuidorElimina`, {
                    idCaptura: item.id
                }).then(res => {
                    setLoader('hide');

                    this.getCapturasDistribuidores();

                    if (this.distribuidorActual.trim() !== '') {
                        this.getCapturasDistribuidor();
                    }
                }).catch(err => validError(err));
            }    
        },
        sortData(data) {
            return data.sort((a, b) => {
                // Sort by CveDistribuidor (alphabetically)
                if (a.cveDistribuidor !== b.cveDistribuidor) {
                    return a.cveDistribuidor.localeCompare(b.cveDistribuidor);
                }
                // Sort by Año (descending)
                if (b.anio !== a.anio) {
                    return b.anio - a.anio;
                }
                // Sort by Mes (descending)
                return b.mes - a.mes;
            });
        },
        generateYearMonthRange(startYear, startMonth, endYear, endMonth) {
            let periods = [];
            let currentYear = startYear;
            let currentMonth = startMonth;

            while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
                let anioMes = `${currentYear}${currentMonth.toString().padStart(2, '0')}`;
                let anioMesStr = `${currentYear}/${currentMonth.toString().padStart(2, '0')}`;
                periods.push({
                    anio: currentYear,
                    mes: currentMonth,
                    periodo: anioMes,
                    anioMes: anioMesStr,
                    disabled: true,
                    importe: '',
                    exitoso: false,
                    error: ''
                });

                // Incrementar el mes
                currentMonth++;
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear++;
                }
            }

            return periods;
        },
        cambiaDistribuidor() {
            if (this.ddl.distribuidor !== '0') {
                this.show.capturar = true;
            }
        },
        reinicia() {
            this.array.anioMes.forEach(i => {
                i.importe = '';
                i.edita = true;
            });
        },
        formatNumber(value) {
            if (typeof value === 'object') {
                if (Number.isNaN(Number(value.importe))) {
                    value.importe = '';
                    return;
                }
                if (Number(value.importe) === 0) {
                    value.importe = '';
                    return;
                }
                value.importe = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value.importe)}`;
            } else {
                if (Number.isNaN(Number(value))) {
                    return '';
                }
                if (Number(value) === 0) {
                    return '';
                }

                return formatted = `$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
            } 
        },
        unFormat(value) {
            if (typeof value === 'object') {
                var val = Number(value.importe.toString().replace(/[^0-9.-]/g, ''));
                if (Number.isNaN(Number(val))) {
                    value.importe = '';
                    return;
                }
                if (Number(val) === 0) {
                    value.importe = '';
                    return;
                }

                value.importe = Number(value.importe.toString().replace(/[^0-9.-]/g, ''))
            } else {
                var val = Number(value.toString().replace(/[^0-9.-]/g, ''));
                if (Number.isNaN(Number(val))) {
                    return 0;
                }
                if (Number(val) === 0) {
                    return 0;
                }

                return Number(value.toString().replace(/[^0-9.-]/g, ''));
            }
        },
        getReporte(tipo) {
            return new Promise((success, fail) => {
                setLoader();

                // Fetch the PDF for preview
                axios.post(`${url}RedOsel/CapturaMayoristas`, {
                    idUsuario: mainApp.idUsuario,
                    nombre: this.nombre,
                    idSemestre: this.idSemestre,
                    codigoSage: this.codigoSage,
                    tipo: tipo
                }, {
                    responseType: 'blob'
                }).then(response => {
                    console.log(response);

                    var link = document.createElement('a');

                    const file = new Blob([response.data], { type: response.headers['content-type'] });
                    var url = URL.createObjectURL(file);
                    link.href = url;
                    link.download = tipo === 1 ? 'CapturaMayoristasDistribuidores.pdf' : 'CapturaMayoristasDistribuidores.xlsx';
                    link.target = '_blank';
                    link.click();

                    URL.revokeObjectURL(url);
                    link = null;
                    setLoader('hide');
                }).catch(error => {
                    validError(error);
                });
            })
        },

        getNombreDistribuidor() {
            return this.array.distribuidores.find(i => i.cliente.trim() === this.ddl.distribuidor.trim())?.nombre || "";

        }
    },
    computed: {
        totalCapturado() {
            let total = 0;

            if (this.array.anioMes.length > 0) {
                this.array.anioMes.forEach(i => {
                    total += parseFloat(i.importe.toString().replace(/[^0-9.-]/g, '')) || 0;
                })
            }

            return this.formatNumber(total);
        },
        totalVentas() {
            let total = 0;

            if (this.array.ventas.length > 0) {
                this.array.ventas.forEach(i => {
                    total += parseFloat(i.venta.toString().replace(/[^0-9.-]/g, '')) || 0;
                })
            }

            return this.formatNumber(total);
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(96, 'mainBg', 'divBanner');
            //mainApp.setBanner(89, 'bannerEdoCuenta', 'divBanner');

            this.getDatos();
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appVentasMayoristas');

function sortData(data) {
    return data.sort((a, b) => {
        // Sort by CveDistribuidor (alphabetically)
        if (a.cveDistribuidor !== b.cveDistribuidor) {
            return a.cveDistribuidor.localeCompare(b.cveDistribuidor);
        }
        // Sort by Año (descending)
        if (b.año !== a.año) {
            return b.año - a.año;
        }
        // Sort by Mes (descending)
        return b.mes - a.mes;
    });
}

