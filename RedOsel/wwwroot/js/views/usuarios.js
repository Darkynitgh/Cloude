

Vue.createApp({
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            shTabla: true,
            usuarios: [],
            perfiles: [], // Array of profile options
            estatus: [], 
            usuarioFiltro: "",
            correoFiltro: "",
            razonSocialFiltro: "",
            titulo_modal: "",
            usuario: {
                username: "",
                password: "",
                confirmPassword: "",
                nombre: "",
                apellidos: "",
                correo: "",
                telefono: "",
                idPerfil: 0,
                idEstatus: 0,
                encargado: '',
                auxSage: '',
                idAnterior:0
            },
            show: {
                password: false,
                confirmPassword:false,
            },
            idUsuario: 0,
            nuevoUsuario: false,
            tipo: 0,
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                correo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                usuario: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                nombre: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                telefono: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                fecha: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                perfil: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                estatus: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                sage: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            },
            array: {
                zonas: [],
                vendedores: []
            },
            ddl: {
                zona: '0',
                vendedor: '0'
            }
        };
    },
    methods: {
        abreAcordion() {
            this.limpiar();
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        agregarUsuario() {
            this.titulo_modal = 'Nuevo Usuario';
            this.limpiar(1);
            this.usuario.idEstatus = '1';
            this.nuevoUsuario = true;
            $('#modal_usuario').modal('show');
        },
        editarUsuario(usuario) {
            this.nuevoUsuario = false;
            this.titulo_modal = 'Edita Usuario';
            $('.cargando-c').show();

            axios.post(url + 'Usuarios/UsuarioRecupera', {
                idUsuario:usuario.id_usuario,
                tipo: this.tipo
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(result => {

                console.log(result.data)
                let ds = result.data;
                this.show.password = false;
                this.show.confirmPassword = false;
                this.idUsuario = this.tipo === 0 ? ds.id_usuario : ds.id_usuario_ciac;
                this.usuario.username = ds.usuario;
                this.usuario.password = '';
                this.usuario.confirmPassword = '';

                this.usuario.nombre = ds.nombre;
                this.usuario.apellidos = ds.apellidos ?? '';
                this.usuario.correo = this.tipo === 0 ? (ds.correo_electronico ?? '') : (ds.correo ?? '');
                this.usuario.telefono = ds?.telefono ?? '';
                this.usuario.encargado = ds.encargado ?? '';
                this.usuario.auxSage = ds.usuario_aux_sage ?? '';
                this.usuario.idPerfil = ds.id_perfil.toString();
                this.usuario.idEstatus = ds.id_estatus.toString();
                this.ddl.zona = ds.id_zona_ventas?.toString() ?? '0';
                this.ddl.vendedor = ds.id_vendedor?.toString() ?? '0';
                this.usuario.idAnterior = ds.id_anterior || 0;

                $('#modal_usuario').modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async usuarioElimina(usuario) {
            let res = await alerts.confirm('¿Está seguro de eliminar el usuario?');
            if (res) {
                axios.post(url + 'Usuarios/UsuarioElimina', {
                    idUsuario: usuario.id_usuario,
                    tipo: this.tipo
                }).then(response => {
                    alerts.success('Usuario eliminado');

                    this.usuarioFiltro = '';
                    this.correoFiltro = '';
                    this.razonSocialFiltro = "";
                    this.buscar();
                }).catch(err => validError(err));
            }
        },
        limpiar(opcion = 0) {

            if (typeof opcion === "object" || opcion === 0) {
                this.usuarioFiltro = "";
                this.correoFiltro = "";
                this.razonSocialFiltro = "";
            } else {
                this.ddl.vendedor = '0';
                this.ddl.zona = '0';
                this.idUsuario = 0;
                this.usuario.username = '';
                this.usuario.password = '';
                this.usuario.confirmPassword = '';
                this.show.password = false;
                this.show.confirmPassword = false;
                this.usuario.encargado = '';
                this.usuario.auxSage = '';
                this.usuario.nombre = '';
                this.usuario.apellidos = '';
                this.usuario.correo = '';
                this.usuario.telefono = '';
                this.usuario.idPerfil = '0';
                this.usuario.idEstatus = '0';
            }            
        },
        buscar() {
            this.usuarios = [];
            $('.cargando-c').show();

            axios.post(url + 'Usuarios/UsuariosConsulta', {
                usuario: this.usuarioFiltro.trim(),
                correo: this.correoFiltro.trim(),
                razonSocial: this.razonSocialFiltro,
                tipo: this.tipo
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(result => {
                if (Array.isArray(result.data)) {
                    this.usuarios = result.data.map(i => {
                        return {
                            id_usuario: i.id_usuario,
                            usuario: i.usuario,
                            nombre: i.nombre,
                            correo: i.correo_electronico,
                            estatus: i.estatus,
                            perfil: i.perfil,
                            telefono: i.telefono ?? '',
                            sage: i.usuario_aux_sage,
                            fecha_cambio: i.fecha_cambio
                        }
                    });
                }

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardar() {
            let msj = '';

            if (this.usuario.username.trim() === '') {
                msj += '<li>Ingrese el usuario</li>';
            }

            if (!this.nuevoUsuario && this.usuario.password.trim() !== '' && this.usuario.confirmPassword.trim() !== '') {
                if (this.usuario.password.trim() === '') {
                    msj += '<li>Ingrese la contraseña</li>';
                }
                if (this.usuario.confirmPassword.trim() === '') {
                    msj += '<li>Confirme la contraseña</li>';
                } 
            }
            if (this.nuevoUsuario && this.usuario.password.trim() === '') {
                msj += '<li>Ingrese la contraseña</li>';
            }
            if (this.nuevoUsuario && this.usuario.confirmPassword.trim() === '') {
                msj += '<li>Ingrese la confirmación de la contraseña</li>';
            }
            
           
            if (this.usuario.password.trim() !== '' && this.usuario.confirmPassword.trim() !== '') {
                if (this.usuario.password.trim() !== this.usuario.confirmPassword.trim()) {
                    msj += '<li>La contraseña y su confirmación no son iguales</li>';
                }

                let result1 = this.evalPassword(this.usuario.password.trim());
                let result2 = this.evalPassword(this.usuario.confirmPassword.trim())

                if (!result1.strong) {
                    msj += '<li>La contraseña no cumple lo siguiente:<ol class="mb-1">';
                    msj += result1.message + '</ol></li>';
                }
                if (!result2.strong) {
                    msj += '<li>La confirmación de contraseña no cumple lo siguiente:<ol class="mb-1">';
                    msj += result1.message + '</ol></li>';
                }
            }

            if (this.usuario.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre</li>';
            }
            if (this.usuario.apellidos.trim() === '') {
                msj += '<li>Ingrese los apellidos</li>';
            }
            if (this.tipo !== 1 && this.usuario.correo.trim() === '') {
                msj += '<li>Ingrese un correo electrónico</li>';
            }
            if (Number(this.usuario.idPerfil) === 0) {
                msj += '<li>Elija un perfil</li>';
            }
            if (Number(this.usuario.idEstatus) === 0) {
                msj += '<li>Elija un estatus</li>';
            }
            //if (this.tipo === 1 && Number(this.ddl.zona) === 0) {
            //    msj += '<li>Elija la zona de ventas</li>';
            //}

            if (msj === '') {
                let ruta = '';
                if (this.nuevoUsuario) {
                    ruta = 'Usuarios/UsuarioInserta';
                } else {
                    ruta = 'Usuarios/UsuarioActualiza';
                }

                axios.post(url + ruta, {
                    idUsuario: this.idUsuario,
                    usuario: this.usuario.username.trim(),
                    contrasena: this.usuario.password.trim(),
                    nombre: this.usuario.nombre.trim(),
                    apellidos: this.usuario.apellidos.trim(),
                    correo: this.usuario.correo.trim(),
                    telefono: this.usuario.telefono.trim(),
                    idPerfil: this.usuario.idPerfil,
                    idEstatus: this.usuario.idEstatus,
                    encargado: this.usuario.encargado.trim(),
                    usuarioAuxSage: this.usuario.auxSage.trim(),
                    idUsuarioModifica: mainApp.idUsuario,
                    tipo: this.tipo,
                    idZonaVentas: this.ddl.zona,
                    idVendedor: this.ddl.vendedor,
                    idAnterior: this.usuario.idAnterior
                }).then(response => {
                    if (this.nuevoUsuario) {
                        alerts.success('Usuario guardado');
                    } else {
                        alerts.success('Usuario actualizado');
                    }

                    this.usuarioFiltro = '';
                    this.correoFiltro = '';
                    this.buscar();
                    $('#modal_usuario').modal('hide');
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        evalPassword(password) {
            //const password = this;
            let msj = '';
            // Criterios
            const hasMinLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password); // Al menos una letra mayúscula
            const hasLowercase = /[a-z]/.test(password); // Al menos una letra minúscula
            const hasNumber = /\d/.test(password);       // Al menos un número
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Opcional: caracteres especiales
            let strong = true;

            // Evaluar la fortaleza
            if (!hasMinLength) {
                strong = false;
                msj += "<li>La contraseña debe tener al menos 8 caracteres.</li>";
            }
            if (!hasUppercase) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos una letra mayúscula.</li>"
            }
            if (!hasLowercase) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos una letra minúscula.</li>"
            }
            if (!hasNumber) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos un número.</li>"
            }
            if (!hasSpecialChar) {
                strong = false;
                msj += "<li>La contraseña debe incluir al menos un caracter especial.</li>"
            }


            return { strong: strong, message: msj };
        },
        getPerfiles() {
            axios.post(url + 'Perfiles/GetPerfiles', {
                tipo: this.tipo
            }).then(response => {
                this.perfiles = response.data;
            }).catch(err => validError(err));
        },
        getClaves(idTipoClave) {
            axios.post(url + 'Administracion/GetClaves', {
                idTipoClave: idTipoClave,
                opcion: idTipoClave === 22 ? -1 : 0
            }).then(response => {
                switch (idTipoClave) {
                    case 2:
                        this.estatus = response.data;
                        break;
                    case 22:
                        this.array.zonas = response.data;
                        break;
                    case 23:
                        this.array.vendedores = response.data;
                        break;
                }
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
                case 1:
                    if (asc) {
                        this.sorted.correo.asc = true;
                        this.sorted.correo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.correo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.usuario.asc = true;
                        this.sorted.usuario.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.usuario.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.nombre.asc = true;
                        this.sorted.nombre.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.nombre.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.telefono.asc = true;
                        this.sorted.telefono.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.telefono.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 5:
                    if (asc) {
                        this.sorted.fecha.asc = true;
                        this.sorted.fecha.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.fecha.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 6:
                    if (asc) {
                        this.sorted.perfil.asc = true;
                        this.sorted.perfil.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.perfil.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 7:
                    if (asc) {
                        this.sorted.estatus.asc = true;
                        this.sorted.estatus.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.estatus.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 8:
                    if (asc) {
                        this.sorted.sage.asc = true;
                        this.sorted.sage.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.sage.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.correo.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'correo');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'correo', false);
                    }
                    break;
                case 2:
                    if (this.sorted.usuario.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'usuario');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'usuario', false);
                    }
                    break;
                case 3:
                    if (this.sorted.nombre.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'nombre');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'nombre', false);
                    }
                    break;
                case 4:
                    if (this.sorted.telefono.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'telefono');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'telefono', false);
                    }
                    break   
                case 5:
                    if (this.sorted.fecha.asc) {
                        this.usuarios = sortOBjectByDate(this.usuarios, 'fecha_cambio');
                    } else {
                        this.usuarios = sortOBjectByDate(this.usuarios, 'fecha_cambio', false);
                    }
                    break;
                case 6:
                    if (this.sorted.perfil.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'perfil');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'perfil', false);
                    }
                    break;
                case 7:
                    if (this.sorted.estatus.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'estatus');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'estatus', false);
                    }
                    break;
                case 8:
                    if (this.sorted.sage.asc) {
                        this.usuarios = sortObjectsByString(this.usuarios, 'sage');
                    } else {
                        this.usuarios = sortObjectsByString(this.usuarios, 'sage', false);
                    }
                    break;
            }
        } 
    },
    computed: {
        esVistaUsuariosInternos() {
            return this.tipo === 0 ? true : false;
        },
        esVistaUsuariosDistribuidor() {
            return this.tipo === 1 ? true : false;
        }
    },
    mounted() {
        this.tipo = Number(this.$refs.inputTipo.value.trim());

        this.getPerfiles();
        this.getClaves(2);
        this.getClaves(22);
        this.getClaves(23);
        this.buscar();
    }
}).mount('#appUsuarios');



