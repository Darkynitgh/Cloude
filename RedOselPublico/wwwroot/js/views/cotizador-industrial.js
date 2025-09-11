

Vue.createApp({
    data() {
        return {
            array: {
                familias: [],
                colores: [],
                cotizador: []
            },
            ddl: {
                color: '0',
                familia: '0'
            },
            show: {
                baseAgua: false
            },
            check: {
                solvente: false
            },
            familia: ''
        }
    },
    methods: {
        getFamilias() {
            setLoader();
            axios.post(`${url}RedOsel/GetFamilias`, {}).then(res => {
                this.array.familias = res.data;
                setLoader('hide');
            }).catch(err => validError(err));
        },
        getColores(evt) {           
            this.show.baseAgua = false;
            this.array.cotizador = [];

            this.array.colores = [];
            this.ddl.color = '0';
            this.familia = evt.target.options[evt.target.options.selectedIndex].label;

            const baseAgua = ['8660', '8670', '8680'];
            if (baseAgua.some(i => i.trim().includes(this.ddl.familia.toString().trim()))) {
                this.show.baseAgua = true;
            } else {
                this.show.baseAgua = false;
            }

            if (Number(this.ddl.familia) !== 0) {
                setLoader();
                axios.post(`${url}RedOsel/GetColores`, {
                    linea: this.ddl.familia,
                    familia: evt.target.options[evt.target.options.selectedIndex].label
                }).then(res => {
                    this.array.colores = res.data;
                    setLoader('hide');
                }).catch(err => validError(err));
            } else {
                alerts.info('Elija primero una familia');
            }
        },
        getDetalleCotizador() {  
            this.array.cotizador = [];

            if (this.ddl.color.trim() !== '0') {
                setLoader();
                axios.post(`${url}RedOsel/GetDetalleCotizador`, {
                    linea: this.ddl.familia,
                    color: this.ddl.color
                }).then(res => {
                    const response = res.data;
                    this.array.cotizador = [];

                    const baseAgua = ['8660', '8670', '8680'];             


                    if (baseAgua.some(i => i.trim().includes(this.ddl.familia.toString().trim()))) {
                        if (this.ddl.familia.toString().trim() === '8660') {
                            /**
                             * 
                             * INSERT ITEM GALÓN
                             * 
                             */
                            let detalleBaseGalon = {
                                descripcion: 'BASE (2 GALONES)',
                                codigo: response.codigoBaseGal,
                                descripcionGeneral: response.descripcionBG,
                                precioDistribuidor: this.formatNumber(response.precioDBG), // Precio Distbuidor Base Galón
                                precioPublico: this.formatNumber(response.precioPBG), // Precio Publico Base Galón,
                                proporcion: response.proporcionBaseG
                            };

                            let detalleCatalizadorGalon = {
                                descripcion: 'CATALIZADOR',
                                codigo: response.codigoCatalizadorGal,
                                descripcionGeneral: response.descripcionCG,
                                precioDistribuidor: this.formatNumber(response.precioDCG), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPCG), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionCatalizadorG
                            };


                            this.array.cotizador.push({
                                nombre: 'KIT 3 GALONES',
                                detalle: [detalleBaseGalon, detalleCatalizadorGalon],
                                precioDistribuidorTotal: this.formatNumber((
                                    ((response.precioDBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioDCG ?? 0) * (response.proporcionCatalizadorG ?? 1))
                                ).toFixed(2)),
                                precioPublicoTotal: this.formatNumber((
                                    ((response.precioPBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioPCG ?? 0) * (response.proporcionCatalizadorG ?? 1))
                                ).toFixed(2))
                            });

                            /**
                             * INSERT ITEM CUBETA
                             */
                            let detalleBaseCubeta = {
                                descripcion: 'BASE (2 CUBETAS)',
                                codigo: response.codigoBaseCub,
                                descripcionGeneral: response.descripcionBQ,
                                precioDistribuidor: this.formatNumber(response.precioDBQ), // Precio Distribuidor Base Cubeta
                                precioPublico: this.formatNumber(response.precioPBQ), // Precio Público Base Cubeta
                                proporcion: response.proporcionBaseQ
                            };

                            let detalleCatalizadorCubeta = {
                                descripcion: 'CATALIZADOR',
                                codigo: response.codigoCatalizadorCub,
                                descripcionGeneral: response.descripcionCQ,
                                precioDistribuidor: this.formatNumber(response.precioDCQ), // Precio Distribuidor Catalizador Cubeta
                                precioPublico: this.formatNumber(response.precioPCQ), // Precio Público Catalizador Cubeta
                                proporcion: response.proporcionCatalizadorQ
                            };

                            // INSERT ITEM CUBETA
                            this.array.cotizador.push({
                                nombre: 'KIT 3 CUBETAS',
                                detalle: [detalleBaseCubeta, detalleCatalizadorCubeta],
                                precioDistribuidorTotal: this.formatNumber((
                                    ((response.precioDBQ ?? 0) * (response.proporcionBaseQ ?? 1)) +
                                    ((response.precioDCQ ?? 0) * (response.proporcionCatalizadorQ ?? 1))
                                ).toFixed(2)),
                                precioPublicoTotal: this.formatNumber((
                                    ((response.precioPBQ ?? 0) * (response.proporcionBaseQ ?? 1)) +
                                    ((response.precioPCQ ?? 0) * (response.proporcionCatalizadorQ ?? 1))
                                ).toFixed(2))
                            });
                        } else {
                            /**
                            * 
                            * INSERT ITEM GALÓN
                            * 
                            */
                            let detalleBaseGalon = {
                                descripcion: 'BASE',
                                codigo: response.codigoBaseGal,
                                descripcionGeneral: response.descripcionBG,
                                precioDistribuidor: this.formatNumber(response.precioDBG), // Precio Distbuidor Base Galón
                                precioPublico: this.formatNumber(response.precioPBG), // Precio Publico Base Galón,
                                proporcion: response.proporcionBaseG
                            };

                            let detalleCatalizadorGalon = {
                                descripcion: 'CATALIZADOR',
                                codigo: response.codigoCatalizadorGal,
                                descripcionGeneral: response.descripcionCG,
                                precioDistribuidor: this.formatNumber(response.precioDCG), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPCG), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionCatalizadorG
                            };


                            this.array.cotizador.push({
                                nombre: 'KIT GALÓN',
                                detalle: [detalleBaseGalon, detalleCatalizadorGalon],
                                precioDistribuidorTotal: this.formatNumber((
                                    ((response.precioDBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioDCG ?? 0) * (response.proporcionCatalizadorG ?? 1))
                                ).toFixed(2)),
                                precioPublicoTotal: this.formatNumber((
                                    ((response.precioPBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioPCG ?? 0) * (response.proporcionCatalizadorG ?? 1))
                                ).toFixed(2))
                            });

                            response.codigoBaseCub = response.codigoBaseCub ?? '';
                            response.descripcionBQ = response.descripcionBQ ?? '';
                            response.codigoCatalizadorCub = response.codigoCatalizadorCub ?? '';
                            response.descripcionCQ = response.descripcionCQ ?? '';

                            if (response.codigoBaseCub !== ''
                                && response.descripcionBQ !== ''
                                && response.codigoCatalizadorCub !== ''
                                && response.descripcionCQ !== '') {
                                /**
                                * INSERT ITEM CUBETA
                                */
                                let detalleBaseCubeta = {
                                    descripcion: 'BASE',
                                    codigo: response.codigoBaseCub,
                                    descripcionGeneral: response.descripcionBQ,
                                    precioDistribuidor: this.formatNumber(response.precioDBQ), // Precio Distribuidor Base Cubeta
                                    precioPublico: this.formatNumber(response.precioPBQ), // Precio Público Base Cubeta
                                    proporcion: response.proporcionBaseQ
                                };

                                let detalleCatalizadorCubeta = {
                                    descripcion: 'CATALIZADOR',
                                    codigo: response.codigoCatalizadorCub,
                                    descripcionGeneral: response.descripcionCQ,
                                    precioDistribuidor: this.formatNumber(response.precioDCQ), // Precio Distribuidor Catalizador Cubeta
                                    precioPublico: this.formatNumber(response.precioPCQ), // Precio Público Catalizador Cubeta
                                    proporcion: response.proporcionCatalizadorQ
                                };

                                // INSERT ITEM CUBETA
                                this.array.cotizador.push({
                                    nombre: 'KIT CUBETA',
                                    detalle: [detalleBaseCubeta, detalleCatalizadorCubeta],
                                    precioDistribuidorTotal: this.formatNumber((
                                        ((response.precioDBQ ?? 0) * (response.proporcionBaseQ ?? 1)) +
                                        ((response.precioDCQ ?? 0) * (response.proporcionCatalizadorQ ?? 1))
                                    ).toFixed(2)),
                                    precioPublicoTotal: this.formatNumber((
                                        ((response.precioPBQ ?? 0) * (response.proporcionBaseQ ?? 1)) +
                                        ((response.precioPCQ ?? 0) * (response.proporcionCatalizadorQ ?? 1))
                                    ).toFixed(2))
                                });
                            }
                         

                        }
                    } else {
                        /**
                         * 
                         *  SOLVENTES
                         * 
                         * 
                         */


                        const solventePaquetes = ['8401', '8403'];

                        let cubeta1, cubeta2;
                        if (solventePaquetes.some(i => i.trim().includes(this.ddl.familia.toString().trim()))) {
                            cubeta1 = 'KIT CUBETA 18L';
                            cubeta2 = 'KIT CUBETA 36L';
                        } else {
                            cubeta1 = 'KIT CUBETA';
                            cubeta2 = 'KIT CUBETA';
                        }


                        /**
                        * 
                        * INSERT ITEM GALÓN
                        * 
                        */

                       // BASE
                        let detalleBaseGalon = {
                            descripcion: 'BASE',
                            codigo: response.codigoBaseGal,
                            descripcionGeneral: response.descripcionBG,
                            precioDistribuidor: this.formatNumber(response.precioDBG), // Precio Distbuidor Base Galón
                            precioPublico: this.formatNumber(response.precioPBG), // Precio Publico Base Galón,
                            proporcion: response.proporcionBaseG,
                            esSolvente: false
                        };

                        // CATALIZADOR
                        let detalleCatalizadorGalon = {
                            descripcion: 'CATALIZADOR',
                            codigo: response.codigoCatalizadorGal,
                            descripcionGeneral: response.descripcionCG,
                            precioDistribuidor: this.formatNumber(response.precioDCG), // Precio Distribuidor Catalizador Galón
                            precioPublico: this.formatNumber(response.precioPCG), // Precio Publico Catalizador Galón
                            proporcion: response.proporcionCatalizadorG,
                            esSolvente: false
                        };

                        // SOLVENTE
                        let detalleSolventeGalon = {
                            descripcion: 'SOLVENTE (1 LITRO)',
                            codigo: response.codigoSolvente,
                            descripcionGeneral: response.descripcionS,
                            precioDistribuidor: this.formatNumber(response.precioSD), // Precio Distribuidor Catalizador Galón
                            precioPublico: this.formatNumber(response.precioSP), // Precio Publico Catalizador Galón
                            proporcion: response.proporcionSolvG,
                            esSolvente: true
                        };

                        // COLORANTE   
                        let detalleColoranteGalon = {
                            descripcion: 'COLORANTES',
                            codigo: 'COLOSEL',
                            descripcionGeneral: response.descripcionColor ?? response.color,
                            precioDistribuidor: this.formatNumber(response.precioDColoranteGal), // Precio Distribuidor Catalizador Galón
                            precioPublico: this.formatNumber(response.precioPColoranteGal), // Precio Publico Catalizador Galón
                            proporcion: response.proporcionColoranteG,
                            esSolvente: false
                        };


                        this.array.cotizador.push({
                            nombre: 'KIT GALÓN',
                            formula: response.formulaG,
                            detalle: [detalleBaseGalon, detalleCatalizadorGalon, detalleSolventeGalon, detalleColoranteGalon],
                            precioDistribuidorTotal: this.formatNumber((
                                ((response.precioDBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                ((response.precioDCG ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                (this.check.solvente && (response.precioSD ?? 0) * (response.proporcionSolvG ?? 1)) +
                                ((response.precioDColoranteGal ?? 0) * (response.proporcionColoranteG ?? 1))
                            ).toFixed(2)),
                            precioPublicoTotal: this.formatNumber((
                                ((response.precioPBG ?? 0) * (response.proporcionBaseG ?? 1)) +
                                ((response.precioPCG ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                (this.check.solvente && (response.precioSP ?? 0) * (response.proporcionSolvG ?? 1)) + 
                                ((response.precioPColoranteGal ?? 0) * (response.proporcionColoranteG ?? 1))
                            ).toFixed(2))
                        });




                        /**
                        * 
                        * INSERT ITEM CUBETA 9L
                        * 
                        */
                        response.codigoBaseCub = response.codigoBaseCub ?? '';
                        response.descripcionBQ = response.descripcionBQ ?? '';
                        response.codigoCatalizadorCub = response.codigoCatalizadorCub ?? '';
                        response.descripcionCQ = response.descripcionCQ ?? '';

                        if (response.codigoBaseCub !== ''
                            && response.descripcionBQ !== ''
                            && response.codigoCatalizadorCub !== ''
                            && response.descripcionCQ !== '') {
                            // BASE
                            let detalleBaseGalon = {
                                descripcion: 'BASE',
                                codigo: response.codigoBaseCub,
                                descripcionGeneral: response.descripcionBQ,
                                precioDistribuidor: this.formatNumber(response.precioDBQ), // Precio Distbuidor Base Galón
                                precioPublico: this.formatNumber(response.precioPBQ), // Precio Publico Base Galón,
                                proporcion: response.proporcionBaseG ?? 1,
                                esSolvente: false
                            };

                            // CATALIZADOR
                            let detalleCatalizadorGalon = {
                                descripcion: 'CATALIZADOR',
                                codigo: response.codigoCatalizadorCub,
                                descripcionGeneral: response.descripcionCQ,
                                precioDistribuidor: this.formatNumber(response.precioDCQ), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPCQ), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionCatalizadorG ?? 1,
                                esSolvente: false
                            };

                            // SOLVENTE
                            let detalleSolventeGalon = {
                                descripcion: 'SOLVENTE (3 LITRO)',
                                codigo: response.codigoSolvente,
                                descripcionGeneral: response.descripcionS,
                                precioDistribuidor: this.formatNumber(response.precioSD * response.proporcionSolvQ), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioSP * response.proporcionSolvQ), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionSolvQ,
                                esSolvente: true
                            };

                            // COLORANTE   
                            let detalleColoranteGalon = {
                                descripcion: 'COLORANTES',
                                codigo: 'COLOSEL',
                                descripcionGeneral: response.descripcionColor ?? response.color,
                                precioDistribuidor: this.formatNumber(response.precioDColoranteCub * response.proporcionColoranteQ), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPColoranteCub * response.proporcionColoranteQ), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionColoranteQ,
                                esSolvente: false
                            };


                            this.array.cotizador.push({
                                nombre: cubeta1,
                                formula: response.formulaQ,
                                detalle: [detalleBaseGalon, detalleCatalizadorGalon, detalleSolventeGalon, detalleColoranteGalon],
                                precioDistribuidorTotal: this.formatNumber((
                                    ((response.precioDBQ ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioDCQ ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                    (this.check.solvente && (response.precioSD ?? 0) * (response.proporcionSolvQ ?? 1)) +
                                    ((response.precioDColoranteCub ?? 0) * (response.proporcionColoranteQ ?? 1))
                                ).toFixed(2)),
                                precioPublicoTotal: this.formatNumber((
                                    ((response.precioPBQ ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioPCQ ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                    (this.check.solvente && (response.precioSP ?? 0) * (response.proporcionSolvQ ?? 1)) +
                                    ((response.precioPColoranteCub ?? 0) * (response.proporcionColoranteQ ?? 1))
                                ).toFixed(2))
                            });

                        }
                                           



                        /**
                        * 
                        * INSERT ITEM CUBETA 18L
                        * 
                        */
                        response.codigoBaseCub18 = response.codigoBaseCub18 ?? '';
                        response.descripcionBQ18 = response.descripcionBQ18 ?? '';
                        response.codigoCatalizadorCub18 = response.codigoCatalizadorCub18 ?? '';
                        response.descripcionCQ18 = response.descripcionCQ18 ?? '';

                        if (response.codigoBaseCub18 !== ''
                            && response.descripcionBQ18 !== ''
                            && response.codigoCatalizadorCub18 !== ''
                            && response.descripcionCQ18 !== '') {
                            // BASE
                            let detalleBaseGalon = {
                                descripcion: 'BASE',
                                codigo: response.codigoBaseCub18,
                                descripcionGeneral: response.descripcionBQ18,
                                precioDistribuidor: this.formatNumber(response.precioDBQ18), // Precio Distbuidor Base Galón
                                precioPublico: this.formatNumber(response.precioPBQ18), // Precio Publico Base Galón,
                                proporcion: response.proporcionBaseG ?? 1,
                                esSolvente: false
                            };

                            // CATALIZADOR
                            let detalleCatalizadorGalon = {
                                descripcion: 'CATALIZADOR',
                                codigo: response.codigoCatalizadorCub18,
                                descripcionGeneral: response.descripcionCQ18,
                                precioDistribuidor: this.formatNumber(response.precioDCQ18), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPCQ18), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionCatalizadorG ?? 1,
                                esSolvente: false
                            };

                            // SOLVENTE
                            let detalleSolventeGalon = {
                                descripcion: 'SOLVENTE (6 LITRO)',
                                codigo: response.codigoSolvente,
                                descripcionGeneral: response.descripcionS,
                                precioDistribuidor: this.formatNumber(response.precioSD * response.proporcionSolvQ18), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioSP * response.proporcionSolvQ18), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionSolvQ18,
                                esSolvente: true
                            };

                            // COLORTANTE   
                            let detalleColoranteGalon = {
                                descripcion: 'COLORANTES',
                                codigo: 'COLOSEL',
                                descripcionGeneral: response.descripcionColor ?? response.color,
                                precioDistribuidor: this.formatNumber(response.precioDColoranteCub * response.proporcionColoranteQ18), // Precio Distribuidor Catalizador Galón
                                precioPublico: this.formatNumber(response.precioPColoranteCub * response.proporcionColoranteQ18), // Precio Publico Catalizador Galón
                                proporcion: response.proporcionColoranteQ18,
                                esSolvente: false
                            };


                            this.array.cotizador.push({
                                nombre: cubeta2,
                                formula: response.formulaQ18,
                                detalle: [detalleBaseGalon, detalleCatalizadorGalon, detalleSolventeGalon, detalleColoranteGalon],
                                precioDistribuidorTotal: this.formatNumber((
                                    ((response.precioDBQ18 ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioDCQ18 ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                    (this.check.solvente && (response.precioSD ?? 0) * (response.proporcionSolvQ18 ?? 1)) +
                                    ((response.precioDColoranteCub ?? 0) * (response.proporcionColoranteQ18 ?? 1))
                                ).toFixed(2)),
                                precioPublicoTotal: this.formatNumber((
                                    ((response.precioPBQ18 ?? 0) * (response.proporcionBaseG ?? 1)) +
                                    ((response.precioPCQ18 ?? 0) * (response.proporcionCatalizadorG ?? 1)) +
                                    (this.check.solvente && (response.precioSP ?? 0) * (response.proporcionSolvQ18 ?? 1)) +
                                    ((response.precioPColoranteCub ?? 0) * (response.proporcionColoranteQ18 ?? 1))
                                ).toFixed(2))
                            });                                    
                        }                        
                    }
                    
                    setLoader('hide');
                }).catch(err => validError(err));
            } else {
                alerts.info('Elija un color');
            }           
        },
        formatNumber(value) {
            if (value == null || isNaN(value)) return "0.00"; // Handle null/undefined cases
            return `$${new Intl.NumberFormat("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value)}`;
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(116, 'mainBg', 'divBanner');

            this.getFamilias();
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appCotizadorIndustrial')