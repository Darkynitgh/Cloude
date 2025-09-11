


Vue.createApp({
    data() {
        return {
            array: {
                contenidos: []
            },
            tituloModal: '',
            idContenidoHtml: 0,
            contenido: ''
        }
    },
    methods: {
        getContenidos() {
            $('.cargando-c').show();
            axios.post(`${url}Contenido/Consulta`, {}).then(res => {
                this.array.contenidos = res.data.map(i => {
                    return {
                        ...i,
                        fecha: luxon.DateTime.fromISO(i.feultmod ?? i.fecha_creacion).toFormat('dd/MM/yyyy HH:mm')
                    }
                })
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getContenido(item) {
            $('.cargando-c').show();
            axios.post(`${url}Contenido/Recupera`, {
                idContenidoHtml: item.id_contenido_html
            }).then(res => {
                this.tituloModal = 'Edición de ' + item.nombre_contenido;
                this.idContenidoHtml = item.id_contenido_html;

                tinymce.get('taContenido').setContent(item.contenido);

                $('#modalContenido').modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardar() {
            if (tinymce.get('taContenido').getContent() === '') {
                alerts.error('Verifique lo siguiente', '<li>Ingrese el contenido de la página</li>');
            } else {
                $('.cargando-c').show();
                axios.post(`${url}Contenido/Actualiza`, {
                    idContenidoHtml: this.idContenidoHtml,
                    contenido: tinymce.get('taContenido').getContent().trim(),
                    idUsuario: mainApp.idUsuario
                }).then(_ => {
                    alerts.success('Contenido actualizado');
                    $('#modalContenido').modal('hide');
                    this.getContenidos();

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        init() {
            let initOpcions = {
                selector: '#taContenido',
                plugins: 'contextmenu print preview paste image searchreplace autolink save directionality code visualblocks visualchars fullscreen link codesample table charmap hr pagebreak anchor toc insertdatetime advlist lists wordcount  textpattern help charmap emoticons importcss',
                menubar: 'file edit view insert format tools table help',
                toolbar: 'undo redo code | table image | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview print | link anchor | ltr rtl',
                language: 'es_MX',
                importcss_append: true,
                content_css: ['https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css'], 
                height: 500,
                quickbars_selection_toolbar: 'bold italic | link blockquote',
                toolbar_mode: 'sliding',
                convert_urls: false,
                contextmenu: 'bold italic underline | link',
                file_picker_types: 'image',
                image_caption: true,
                file_picker_callback: (callback, value, meta) => {
                    // Provide image and alt text for the image dialog
                    if (meta.filetype == 'image') {
                        var input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.png, .jpg';
                        input.multiple = false;

                        input.onchange = (evt) => {
                            var imagen = evt.target.files[0];

                            if (imagen.size > 1 * 1024 * 1024) {
                                alert('El tamaño de la imagen no es permitido, máximo 1 MB');
                                input.value = '';
                                return;
                            }

                            var ext = '.png, .jpg, .jpeg'.split(',');
                            ext = ext.filter(a => typeof a !== 'undefined');

                            ext.forEach(a => {
                                a = a.trimStart().trimEnd();
                            });
                            var a = imagen.type.split('/');;
                            let fileExtension = a[a.length - 1];

                            if (!ext.some(a => a.trim() === `.${fileExtension}`)) {
                                alert('Formato del archivo inválido');
                                input.value = '';
                                return;
                            }

                            var ds = new FormData();
                            ds.append('archivo', imagen);

                            $('.cargando-c').show();
                            axios.post(url + 'Archivos/Imagen', ds).then(res => {
                                let ds = res.data;

                                $('.cargando-c').hide();
                                callback(url + ds.rutaServidor, { alt: imagen.name });
                            }).catch(err => alert(err));
                        }

                        input.click();
                    }
                }
            }

            tinymce.init(initOpcions);
        },
        preview(item) {
            const body = document.getElementById('modalBody');
            const iframe = document.createElement("iframe");  
            iframe.classList.add("preview-iframe");

            body.innerHTML = '';

            // Append iframe to the container
            body.appendChild(iframe);

            // Define the preview HTML content
            const previewHTML = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" />
              
                </head>
                <body>
                      ${item.contenido}
                </body>
                </html>
            `;

            // Write the HTML inside the iframe
            iframe.contentWindow.document.open();
            iframe.contentWindow.document.write(previewHTML);
            iframe.contentWindow.document.close();

            //this.contenido = item.contenido;
            $('#preview').modal('show'); 
        }
    },
    mounted() {
        this.init();
        this.getContenidos();
    }
}).mount('#appContenidoHtml')