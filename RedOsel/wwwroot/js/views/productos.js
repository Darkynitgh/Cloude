

Vue.createApp({
    components: {
        FichaTecnica: window.componenteArchivos,
        HojaSeguridad: window.componenteArchivos,
        ImagenProducto: window.componenteArchivos
    },
    data(){
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                productos: [],
                familias: [],
                familiasFiltro: []
            },
            ddl: {
                familiaFiltro: '0',
                paginacion: '30',
                estatus: '-1',
                familia: '0',
            },
            value: {
                nombreFiltro: '',
                codigoFiltro: '',
                nombre: '',
                codigo: '',
                orden: '0',
                descripcion: '',
                usos: ''
            },
            check: {
                aguaFiltro: false,
                solventeFiltro: false,
                agua: false,
                solvente: false,
                publicado: false
            },
            disabled: {
                fichaTecnica: true,
                hojaSeguridad: true,
                imagenProducto: true,
                guardar: false
            },
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            ////////////
            idProducto: 0,
            tipoMultimedia: {
                hojaSeguridad: 1,
                fichaTecnica: 2,             
                imagenProducto: 3
            },
            check: {
                publicados: false
            },
            productoItem: null,
            producto: '',
            caracteristicas: '',
            envasado: '',
            imagenProducto: '',
            descripcion: '',
            usos: '',
            listaFichas: [],
            listaHojas: [],
            especificaciones: '',
            codigo: '',
            idNaturaleza: 0,
            //Variables filtro en tablas
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                id: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                familia: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                codigo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                nombre: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                orden: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                publicado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                hoja: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                ficha: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }        
        }
    },
    methods: {
        abreAcordion() {
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        checkTipo(opcion, origen = 0) {
            if (origen === 0) {
                if (opcion === 1) {
                    this.check.aguaFiltro = this.$refs.chkAgua.checked;
                    this.check.solventeFiltro = false;
                }
                if (opcion === 2) {
                    this.check.aguaFiltro = false;
                    this.check.solventeFiltro = this.$refs.chkSolvente.checked;
                }

                if (this.check.aguaFiltro || this.check.solventeFiltro) {
                    this.getFamilias();
                } else {
                    this.array.familiasFiltro = [];
                    this.ddl.familiaFiltro = '0';
                }
            } else {
                if (opcion === 1) {
                    this.check.agua = this.$refs.chkAguaT.checked;
                    this.check.solvente = false;
                }
                if (opcion === 2) {
                    this.check.agua = false;
                    this.check.solvente = this.$refs.chkSolventeT.checked;
                }

                if (this.check.agua || this.check.solvente) {
                    this.getFamilias(1);
                } else {
                    this.array.familias = [];
                    this.ddl.familia = '0';
                }
            }
        },
        getFamilias(origen = 0) {
            return new Promise((success, fail) => {
                let idTipoNaturaleza = 0;
                if (origen === 0) {
                    this.array.familiasFiltro = [];
                    idTipoNaturaleza = this.check.aguaFiltro ? 1 : 2;
                } else {
                    this.array.familias = [];
                    idTipoNaturaleza = this.check.agua ? 1 : 2;
                }

                $('.cargando-c').show();
                axios.post(url + 'Productos/FamiliasConsulta', {
                    idTipoNaturaleza: idTipoNaturaleza
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    let ds = res.data;

                    if (origen === 0) {
                        this.array.familiasFiltro = [];
                        this.ddl.familiaFiltro = '0';
                        this.array.familias = ds;
                    } else {
                        this.array.familias = [];
                        this.ddl.familia = '0';
                        this.array.familias = ds;
                    }

                    $('.cargando-c').hide();
                    success('');
                }).catch(err => {
                    validError(err);
                    fail(err);
                });
            })
        },
        getProductos() {
            //if (this.check.aguaFiltro || this.check.solventeFiltro) {
            //    if (Number(this.ddl.familiaFiltro) === 0) {
            //        alerts.warning('Elija primero una familia')
            //        return;
            //    }
            //}
            let tipo = 0;
            if (this.check.aguaFiltro) {
                tipo = 1;
            }
            if (this.check.solventeFiltro) {
                tipo = 2;
            }

            this.array.productos = [];
            $('.cargando-c').show();
            axios.post(url + 'Productos/ProductosConsulta', {
                tipoNaturaleza: tipo,
                idFamilia: this.ddl.familiaFiltro,
                nombre: this.value.nombreFiltro,
                codigo: this.value.codigoFiltro,
                publicado: this.ddl.estatus
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                let ds = res.data === '' ? [] : res.data.map(a => {
                    return {
                        ...a,
                        totalHojaSeguridad: a.multimedia?.find(b => b.id_tipo_multimedia === 1)?.cantidad ?? 0,                        
                        totalFichaTecnica: a.multimedia?.find(b => b.id_tipo_multimedia === 2)?.cantidad ?? 0,
                    }
                });

                this.array.productos = ds;

                this.totalResults = this.array.productos.length;
                this.totalPages = Math.ceil(this.array.productos.length / this.perPage);
                this.currentPage = 1;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getProducto(item, rtn = false) {
            return new Promise((success, fail) => {
                if (!rtn) {
                    this.tituloModal = 'Editar Producto';
                    this.limpiar(1);
                }

                $('.cargando-c').show();
                axios.post(url + 'Productos/ProductoRecupera', {
                    idProducto: item.id_producto,
                    idTipoMultimedia: '1,2,3,'
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(async res => {
                    let ds = res.data;


                    if (rtn) {
                        success(ds);
                    }


                    this.productoItem = ds;

                    $(this.$refs.modalProducto).modal('show');

                    this.idProducto = ds.id_producto;
                    this.value.nombre = ds.nombre;
                    this.value.codigo = ds.codigo;
                    this.check.publicado = ds.estatus === 1;
                    this.value.orden = ds.orden;

                    this.check.agua = ds.tipoNaturaleza === 1;
                    this.check.solvente = ds.tipoNaturaleza === 2;
                    await this.getFamilias(ds.tipoNaturaleza, 1);
                    this.ddl.familia = ds.idNaturaleza.toString();
                    this.value.descripcion = ds.descripcion;
                    this.value.usos = ds.usos;

                    setTimeout(async a => {
                        tinymce.get('carac').setContent(ds.caracteristicas);
                        tinymce.get('enva').setContent(ds.envasado);
                        tinymce.get('espe').setContent(ds.especificaciones);
                    }, 20);

                    this.disabled.hojaSeguridad = false;
                    this.disabled.fichaTecnica = false;
                    this.disabled.imagenProducto = false;

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            })          
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.check.aguaFiltro = false;
                this.check.solventeFiltro = false;
                this.ddl.familiaFiltro = '0';
                this.value.nombreFiltro = '';
                this.value.codigoFiltro = '';
                this.array.familias = [];
            } else {

                this.productoItem = null;
                this.disabled.guardar = false;
                this.$refs.tabCaract.click();
                this.idProducto = 0;
                this.value.nombre = '';
                this.value.codigo = '';
                //this.ddl.estatus = '2';
                this.value.orden = '0';
                this.check.agua = false;
                this.check.solvente = false;
                this.ddl.familia = '0';
                this.array.familias = [];
                this.value.descripcion = '';
                this.value.usos = '';

                this.check.publicado = false;

                this.disabled.hojaSeguridad = true;
                this.disabled.fichaTecnica = true;
                this.disabled.imagenProducto = true;
            }
        },
        agregarProducto() {
            this.tituloModal = 'Nuevo Producto';
            this.limpiar(1);
            $(this.$refs.modalProducto).modal('show');
        },
        async productoElimina(item) {
            let res = await alerts.confirm(`¿Estás seguro de eliminar el producto <u><i>${item.nombre}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Productos/ProductoElimina', {
                    idProducto: item.id_producto,
                    idUsuario: mainApp.idUsuario
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(async res => {
                    let ds = res.data;

                    alerts.success('Producto eliminado');
                    this.getProductos();


                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        guardar() {
            let msj = '';
            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre</li>';
            }
            if (this.value.codigo.trim() === '') {
                msj += '<li>Ingrese el código</li>';
            }
                if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden</li>';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj += '<li>El número para Orden es inválido</li>';
                }
            }
            if (!this.check.agua && !this.check.solvente) {
                msj += '<li>Elija un tipo de naturaleza</li>';
            }
            if (Number(this.ddl.familia) === 0) {
                msj += '<li>Elija una familia</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripcion</li>';
            }
            if (this.value.usos.trim() === '') {
                msj += '<li>Ingrese los usos</li>';
            }
            if (tinymce.get('enva').getContent().trim().length > 500) {
                msj += '<li>El contenido para "Envasado" rebasa los 500 caracteres, favor de corregir el texto<li>'
            }
            if (tinymce.get('espe').getContent().trim().length > 4000) {
                msj += '<li>El contenido para "Especificaciones" rebasa los 500 caracteres, favor de corregir el texto<li>'
            }


            if (msj === '') {
                let ruta = Number(this.idProducto) === 0 ? 'Productos/ProductoInserta' : 'Productos/ProductoActualiza';

                this.disabled.guardar = true;
                axios.post(url + ruta, {
                    idProducto: this.idProducto,
                    nombre: this.value.nombre.trim(),
                    codigo: this.value.codigo.trim(),
                    orden: this.value.orden,
                    idEstatus: this.check.publicado ? 1 : 2,
                    idFamilia: this.ddl.familia,
                    descripcion: this.value.descripcion.trim(),
                    usos: this.value.usos.trim(),
                    caracteristicas: tinymce.get('carac').getContent(),
                    envasado: tinymce.get('enva').getContent(),
                    especificaciones: tinymce.get('espe').getContent(),
                    idUsuario: mainApp.idUsuario
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {

                    this.disabled.guardar = false;

                    if (this.idProducto === 0) {
                        this.idProducto = res.data;
                        this.disabled.fichaTecnica = false;
                        this.disabled.hojaSeguridad = false;
                        this.disabled.imagenProducto = false;
                    }

                    alerts.success('Producto guardado');
                    this.getProductos();
                    //$(this.$refs.modalProducto).modal('hide');
                }).catch(err => {
                    this.disabled.guardar = false;
                    validError(err)
                });
            } else {
                alerts.error('Verifique lo siguiente', msj);
                //verifyFade();
            }   
        },
        async vistaPrevia() {
            let productoItem;
            if (typeof this.productoItem === 'object' && this.productoItem !== null) {
                productoItem = await this.getProducto(this.productoItem, true);
            } else {
                productoItem = await this.getProducto({ id_producto: this.idProducto }, true);
            }
            
           

            this.producto = productoItem.nombre;
            this.caracteristicas = productoItem.caracteristicas;
            this.envasado = productoItem.envasado;
            this.descripcion = productoItem.descripcion;
            this.usos = productoItem.usos;
            this.especificaciones = productoItem.especificaciones;
            this.codigo = productoItem.codigo;
            this.idNaturaleza = productoItem.idNaturaleza;


            this.listaFichas = [];
            this.listaHojas = [];


            let imagen = '';
            if (productoItem.hasOwnProperty('multimedia') && productoItem.multimedia.length > 0) {
                let idTipoMultimedia = 3;
                imagen = url + this.productoItem.directorio.replace(/\\/g, "/")+ '/' + productoItem.multimedia.find(a => a.id_tipo_multimedia === idTipoMultimedia)?.archivo;

                this.listaHojas = productoItem.multimedia.map(a => {
                    if (a.id_tipo_multimedia === 1) {
                        return {
                            titulo: a.titulo,
                            nombreArchivo: a.archivo,
                            ruta: url + productoItem.directorio.replace(/\\/g, "/") + '/' + a?.archivo
                        }
                    }
                }).filter(a => typeof a === 'object');


                this.listaFichas = productoItem.multimedia.map(a => {
                    if (a.id_tipo_multimedia === 2) {
                        return {
                            titulo: a.titulo,
                            nombreArchivo: a.archivo,
                            ruta: url + productoItem.directorio.replace(/\\/g, "/") + '/' + a?.archivo
                        }
                    }
                }).filter(a => typeof a === 'object');          
            } else {
                if (productoItem.fichatecnica ?? '' !== '') {
                    this.listaFichas.push({
                        titulo: '',
                        nombreArchivo: productoItem.fichatecnica,
                        ruta: productoItem.ruta + productoItem.fichatecnica 
                    })
                }
                if (productoItem.fichatecnica2 ?? '' !== '') {
                    this.listaFichas.push({
                        titulo: '',
                        nombreArchivo: productoItem.fichatecnica2,
                        ruta: productoItem.ruta + productoItem.fichatecnica2
                    })
                }
                if (productoItem.fichatecnica3 ?? '' !== '') {
                    this.listaFichas.push({
                        titulo: '',
                        nombreArchivo: productoItem.fichatecnica3,
                        ruta: productoItem.ruta + productoItem.fichatecnica3
                    })
                }
                if (productoItem.fichatecnica4 ?? '' !== '') {
                    this.listaFichas.push({
                        titulo: '',
                        nombreArchivo: productoItem.fichatecnica4,
                        ruta: productoItem.ruta + productoItem.fichatecnica4
                    })
                }
                if (productoItem.fichatecnica5 ?? '' !== '') {
                    this.listaFichas.push({
                        titulo: '',
                        nombreArchivo: productoItem.fichatecnica5,
                        ruta: productoItem.ruta + productoItem.fichatecnica5
                    })
                }




                if (productoItem.hojadeseguridad ?? '' !== '') {
                    this.listaHojas.push({
                        titulo: '',
                        nombreArchivo: productoItem.hojadeseguridad,
                        ruta: productoItem.ruta + productoItem.hojadeseguridad
                    })
                }
                if (productoItem.hojadeseguridad2 ?? '' !== '') {
                    this.listaHojas.push({
                        titulo: '',
                        nombreArchivo: productoItem.hojadeseguridad2,
                        ruta: productoItem.ruta + productoItem.hojadeseguridad2
                    })
                }
                if (productoItem.hojadeseguridad3 ?? '' !== '') {
                    this.listaHojas.push({
                        titulo: '',
                        nombreArchivo: productoItem.hojadeseguridad3,
                        ruta: productoItem.ruta + productoItem.hojadeseguridad3
                    })
                }
                if (productoItem.hojadeseguridad4 ?? '' !== '') {
                    this.listaHojas.push({
                        titulo: '',
                        nombreArchivo: productoItem.hojadeseguridad4,
                        ruta: productoItem.ruta + productoItem.hojadeseguridad4
                    })
                }
                if (productoItem.hojadeseguridad5 ?? '' !== '') {
                    this.listaHojas.push({
                        titulo: '',
                        nombreArchivo: productoItem.hojadeseguridad5,
                        ruta: productoItem.ruta + productoItem.hojadeseguridad5
                    })
                }
        
            }
            this.imagenProducto = productoItem.imagen ?? '' !== '' ? productoItem.ruta + productoItem.imagen : imagen;

            var a = productoItem.imagen ?? '' === '';
            if (a === '' && imagen === '') {
                this.imagenProducto = '';
            }

            $(this.$refs.vistaPrevia).modal('show');
        },
        // Funciones Paginación
        onClickFirstPage() {
            this.onPageChange(1);
        },
        onClickPreviousPage() {
            this.onPageChange(this.currentPage - 1);
        },
        onClickPage(page) {
            this.onPageChange(page);
        },
        onClickNextPage() {
            this.onPageChange(this.currentPage + 1);
        },
        onClickLastPage() {
            this.onPageChange(this.totalPages);
        },
        isPageActive(page) {
            let marked = false
            if (this.currentPage === page) {
                marked == true
            }
            return marked
        },
        onPageChange(page) {
            ////console.log('page\n', page)
            this.currentPage = parseInt(page);
        },
        filteredItem() {
            return this.array.productos.slice((this.currentPage - 1) * this.perPage, (((this.currentPage - 1) * this.perPage) + this.perPage))
        },
        cambiaPaginacion() {
            this.perPage = parseInt(this.ddl.paginacion)
            this.totalPages = Math.ceil(this.array.productos.length / this.perPage)
            this.currentPage = 1
        },
        init(selector) {
            let initOpcions = {
                selector: selector,
                plugins: 'contextmenu print preview paste searchreplace autolink save directionality code visualblocks visualchars fullscreen link codesample table charmap hr pagebreak anchor toc insertdatetime advlist lists wordcount  textpattern help charmap emoticons importcss',
                menubar: 'file edit view insert format tools table help',
                toolbar: 'undo redo code | table | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview print | link anchor | ltr rtl',
                language: 'es_MX',
                importcss_append: true,
                content_css: ['/redosel/lib/bootstrap/dist/css/bootstrap.min.css'],
                height: 500,
                quickbars_selection_toolbar: 'bold italic | link blockquote',
                toolbar_mode: 'sliding',
                convert_urls: false,
                contextmenu: 'bold italic underline | link table',
            }

            tinymce.init(initOpcions);
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
                        this.sorted.id.asc = true;
                        this.sorted.id.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.id.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.familia.asc = true;
                        this.sorted.familia.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.familia.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.codigo.asc = true;
                        this.sorted.codigo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.codigo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.nombre.asc = true;
                        this.sorted.nombre.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.nombre.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 5:
                    if (asc) {
                        this.sorted.publicado.asc = true;
                        this.sorted.publicado.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.publicado.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 6:
                    if (asc) {
                        this.sorted.orden.asc = true;
                        this.sorted.orden.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.orden.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 7:
                    if (asc) {
                        this.sorted.hoja.asc = true;
                        this.sorted.hoja.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.hoja.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 8:
                    if (asc) {
                        this.sorted.ficha.asc = true;
                        this.sorted.ficha.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.ficha.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.id.asc) {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'id_producto');
                    } else {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'id_producto', false);
                    }
                    break;
                case 2:
                    if (this.sorted.familia.asc) {
                        this.array.productos = this.array.productos.sort((a, b) => {
                            // Handle `null` in idNaturaleza (null values go last)
                            const idA = a.tipoNaturaleza ?? Number.MIN_VALUE;
                            const idB = b.tipoNaturaleza ?? Number.MIN_VALUE;

                            if (idA !== idB) {
                                return idB - idA; // Sort idNaturaleza (nulls at the end)
                            }


                            // Handling null values
                            const dsA = a.ds_familia || ""; // If null, use empty string
                            const dsB = b.ds_familia || ""; // If null, use empty string

                            return dsB.localeCompare(dsA); // Sort by ds_familia safely
                        });
                        console.log('ASC', this.array.productos);
                    } else {
                        this.array.productos = this.array.productos.sort((a, b) => {
                            // Handle `null` in idNaturaleza (null values go first)
                            const idA = a.tipoNaturaleza ?? Number.MIN_VALUE;
                            const idB = b.tipoNaturaleza ?? Number.MIN_VALUE;

                            if (idA !== idB) {
                                return idA - idB; // Sort idNaturaleza (nulls at the top)
                            }


                            // Handling null values
                            const dsA = a.ds_familia || "";
                            const dsB = b.ds_familia || "";

                            return dsA.localeCompare(dsB); // Reverse alphabetical sorting
                        });

                        console.log('DESC', this.array.productos);
                    }
                    break;
                case 3:
                    if (this.sorted.codigo.asc) {
                        this.array.productos = sortObjectsByString(this.array.productos, 'codigo');
                    } else {
                        this.array.productos = sortObjectsByString(this.array.productos, 'codigo', false);
                    }
                    break;
                case 4:
                    if (this.sorted.nombre.asc) {
                        this.array.productos = sortObjectsByString(this.array.productos, 'nombre');
                    } else {
                        this.array.productos = sortObjectsByString(this.array.productos, 'nombre', false);
                    }
                    break;
                case 5:
                    if (this.sorted.publicado.asc) {
                        this.array.productos = sortObjectsByString(this.array.productos, 'publicado');
                    } else {
                        this.array.productos = sortObjectsByString(this.array.productos, 'publicado', false);
                    }
                    break;
                case 6:
                    if (this.sorted.orden.asc) {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'orden');
                    } else {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'orden', false);
                    }
                    break;
                case 7:
                    if (this.sorted.hoja.asc) {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'totalHojaSeguridad');
                    } else {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'totalHojaSeguridad', false);
                    }
                    break;
                case 8:
                    if (this.sorted.ficha.asc) {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'totalFichaTecnica');
                    } else {
                        this.array.productos = sortObjectByNumber(this.array.productos, 'totalFichaTecnica', false);
                    }
                    break;
            }
        } 
    },
    computed: {
        startPage() {
            // When on the first page
            if (this.currentPage === 1) {
                return 1;
            }

            // When on the last page
            if (this.currentPage === this.totalPages && this.totalPages - this.maxVisibleButtons > 0 && this.currentPage <= (this.totalPages - this.maxVisibleButtons)) {
                return this.totalPages - this.maxVisibleButtons;
            }

            if ((this.totalPages - this.maxVisibleButtons) < this.currentPage && (this.totalPages - this.maxVisibleButtons) > 0) {
                return (this.totalPages - this.maxVisibleButtons) + 1
            }

            if (this.totalPages <= 10) {
                return 1;
            }

            // When inbetween            
            return this.currentPage - 1;

        },
        pages() {
            const range = [];
            if (this.startPage == (this.totalPages - this.maxVisibleButtons)) {
                this.startPage = this.startPage + 1
            }
            for (
                let i = this.startPage;
                i <= Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);
                i++
            ) {
                let disabled = false
                if (this.currentPage === this.totalPages && i === this.currentPage) {
                    disabled = true
                } else {
                    if (i === this.currentPage) {
                        disabled = true
                    }
                    if (this.totalPages == 1) {
                        disabled = true
                    }
                }
                range.push({
                    name: i,
                    isDisabled: disabled
                });
            }
            return range;
        },
        isInFirstPage() {
            let disabled = this.currentPage === 1 == true || this.totalPages === 1 == true ? true : false
            return disabled
        },
        isInLastPage() {
            let disabled = this.currentPage === this.totalPages == true ? true : false
            return disabled;
        },
        filtered() {
            return this.filteredItem()
        },
    },    
    mounted() {
        this.getProductos();
 
        this.init('#carac');
        this.init('#enva');
        this.init('#espe')

        $(this.$refs.modalProducto).on('show.bs.modal', () => {
            setTimeout(a => {
                tinymce.get('carac').setContent('');
                tinymce.get('enva').setContent('');
                tinymce.get('espe').setContent('');
            }, 0);
        });

        // Destruir TinyMCE al cerrar el modal
        $(this.$refs.modalProducto).on('hidden.bs.modal', () => {
            //if (tinymce.get('carac')) {
            //    tinymce.get('carac').destroy(); // Eliminar la instancia del editor
            //}
            //if (tinymce.get('enva')) {
            //    tinymce.get('enva').destroy(); // Eliminar la instancia del editor
            //}
            //if (tinymce.get('espe')) {
            //    tinymce.get('espe').destroy(); // Eliminar la instancia del editor
            //}
        });
    }
}).mount('#appProductos');

