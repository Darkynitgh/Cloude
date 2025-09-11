

Vue.createApp({
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                claves: [],
                tipoClaves: []
            },
            ddl: {
                tipoClave: '0',
                tipoClave2: '0'
            },
            value: {
                descripcion: '',
                valor1: '',
                claveCorta1: '',
                claveCorta2: ''
            },
            check: {
                estatus: false
            },
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                descripcion: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                tipo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            },
            tituloModal: '',
            idClave: 0
        }
    },
    methods: {
        limpiar() {
            this.idClave = 0;
            this.ddl.tipoClave2 = '0';
            this.value.descripcion = '';
            this.value.valor1 = '';
            this.value.claveCorta1 = '';
            this.value.claveCorta2 = '';
            this.check.estatus = false;
        },
        abreAcordion() {
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        agregarClave() {
            this.limpiar();
            this.tituloModal = 'Nueva Clave';
            $(this.$refs.modalClaves).modal('show');
        },
        getClaves() {
            $('.cargando-c').show();

            axios.post(`${url}Catalogos/ClavesConsulta`, {
                idTipoClave: this.ddl.tipoClave
            }).then(res => {

                this.array.claves = res.data;
                this.totalResults = this.array.claves.length;
                this.totalPages = Math.ceil(this.array.claves.length / this.perPage);
                this.currentPage = 1;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getClave(item) {
            axios.post(`${url}Catalogos/ClavesRecupera`, { idClave: item.id_clave })
                .then(res => {
                    console.log(res.data);
                    const response = res.data;

                    this.tituloModal = 'Edición Claves';

                    this.idClave = response.id_clave;
                    this.ddl.tipoClave2 = response.id_tipo_clave.toString();
                    this.value.descripcion = response.Cadena;
                    this.value.valor1 = response.Valor1 ?? '';
                    this.value.claveCorta1 = response.cuenta_contable ?? '';
                    this.value.claveCorta2 = response.clave_corta ?? '';
                    this.check.estatus = Boolean(response.id_estatus);

                    $(this.$refs.modalClaves).modal('show');
                })
                .catch(err => validError(err));
        },
        getTipoClaves() {
            axios.post(`${url}Catalogos/TipoClaveConsulta`, {})
                .then(res => this.array.tipoClaves = res.data)
                .catch(err => validError(err));
        },
        guardar() {
            let msj = '';
            if (Number(this.ddl.tipoClave2) === 0) {
                msj += '<li>Elija un tipo de clave</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción de la clave</li>';
            }
            if (this.value.valor1.toString().trim() !== '') {
                if (Number.isNaN(Number(this.value.valor1))) {
                    msj += '<li>Número inválido para Valor 1</li>';
                }
            }

            if (msj.trim() !== '') {
                alerts.error('Verifique lo siguiente', msj);
                return;
            }

            $('.cargando-c').show();
            let ruta = Number(this.idClave) === 0 ? 'Catalogos/ClavesInserta' : 'Catalogos/ClavesActualiza';
            axios.post(`${url}${ruta}`, {
                idClave: this.idClave,
                idTipoClave: this.ddl.tipoClave2,
                texto: this.value.descripcion.trim(),
                valor1: Number(this.value.valor1),
                claveCorta1: this.value.claveCorta1.trim(),
                claveCorta2: this.value.claveCorta2.trim(),
                estatus: this.check.estatus
            }).then(res => {
                Number(this.idClave) === 0 ? alerts.success('Clave guardada') : alerts.success('Clave actualizada');

                this.ddl.tipoClave = this.ddl.tipoClave2.toString();
                this.getClaves();
                $(this.$refs.modalClaves).modal('hide');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        /**
       * 
       * SORTED FUNCTIONS
       * 
       */
        eligeFiltro(opcion, asc = true) {

            for (const i in this.sorted) {
                this.sorted[i].asc = false;
                this.sorted[i].iconoAsc = this.iconoAsc;
                this.sorted[i].iconoDesc = this.iconoDesc;
            }

            switch (opcion) {
                case 2:
                    if (asc) {
                        this.sorted.descripcion.asc = true;
                        this.sorted.descripcion.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.descripcion.iconoDesc = this.iconoDescFill;
                    }
                    this.sortClaves(Number(opcion));
                    break;
                case 6:
                    if (asc) {
                        this.sorted.tipo.asc = true;
                        this.sorted.tipo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.tipo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortClaves(Number(opcion));
                    break;          
            }
        },
        sortClaves(opcion) {
            switch (opcion) {                
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.claves = sortObjectsByString(this.array.claves, 'tipo_clave');
                    } else {
                        this.array.claves = sortObjectsByString(this.array.claves, 'tipo_clave', false);
                    }
                    break;                
                case 6:
                    if (this.sorted.tipo.asc) {
                         this.array.claves = sortObjectsByString( this.array.claves, 'Cadena');
                    } else {
                        this.array.claves = sortObjectsByString(this.array.claves, 'Cadena', false);
                    }
                    break;                
            }
        } 
    },
    mounted() {
        //this.getClaves();
        this.getTipoClaves();
    }
}).mount('#appClaves');