using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class ArchivosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public ArchivosController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<IActionResult> MultimediaInserta()
        {
            try
            {
                string titulo = Request.Form["titulo"];
                string descripcion = Request.Form["descripcion"];
                int idOrigen = int.Parse(Request.Form["idOrigen"]);
                int idTipoMultimedia = int.Parse(Request.Form["idTipoMultimedia"]);
                int idUsuario = int.Parse(Request.Form["idUsuario"]);
                int idTipoArchivo = int.Parse(Request.Form["idTipoArchivo"]);
                int orden = int.Parse(Request.Form["orden"]);
                string fecha = Request.Form["fecha"].ToString();

                MemoryStream file = new();
                MemoryStream imagen = new();

                if (Request.Form.Files.GetFile("archivo") == null)
                {
                    return BadRequest("Error, se requiere un archivo");
                }
                string fileName = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("archivo").FileName);
                string nombreArchivo = fileName + Path.GetExtension(Request.Form.Files.GetFile("archivo").FileName);//+ "_" + DateTime.Now.ToString("HH_mm_ss").ToString() + Path.GetExtension(Request.Form.Files.GetFile("archivo").FileName);
                await Request.Form.Files.GetFile("archivo").CopyToAsync(file);

                string fileNameImage = string.Empty;
                string nombreArchivoImagen = string.Empty;
                string extensionImagen = string.Empty;
                if (Request.Form.Files.GetFile("imagen") != null)
                {
                    await Request.Form.Files.GetFile("imagen").CopyToAsync(imagen);
                    fileNameImage = Request.Form.Files.GetFile("imagen").FileName;
                    nombreArchivoImagen = Path.GetFileNameWithoutExtension(fileNameImage);// + "_" + DateTime.Now.ToString("HH_mm_ss").ToString();
                    extensionImagen = Path.GetExtension(fileNameImage);

                    nombreArchivoImagen += extensionImagen;
                }

                var json = new
                {
                    idTipoMultimedia,
                    idOrigen,
                    titulo,
                    descripcion,
                    imagen = nombreArchivoImagen,
                    idTipoArchivo,
                    idUsuario,
                    nombreArchivo,
                    orden,
                    fecha
                };

                // INSERTA ARCHIVO
                var result = await new AccesoDB(_connectionString).ExecuteQueryAsync(JsonConvert.SerializeObject(json), "dbo.Multimedia_Inserta");
                if (!JObject.Parse(result)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(result)["resultado"].ToString());
                }



                /**
                 * 
                 * LA RUTA ES ==> origenDelSitioWebEnC\carpetaArchivos\idTipoMultimedia\nombreArchivo
                 * 
                 * **/
                //var rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivo);
                var rutaFinal = string.Empty;

                if (idTipoMultimedia.Equals(1)
                    || idTipoMultimedia.Equals(2)
                    || idTipoMultimedia.Equals(3))
                {
                    rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"), nombreArchivo);
                }
                else
                {
                    rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivo);
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = string.Empty;
                if (idTipoMultimedia.Equals(1)
                   || idTipoMultimedia.Equals(2)
                   || idTipoMultimedia.Equals(3))
                {
                    directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"));
                }
                else
                {
                    directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString());
                }
                if (!Directory.Exists(ruta + directorio))
                {
                    Directory.CreateDirectory(ruta + directorio);
                }

                await System.IO.File.WriteAllBytesAsync(ruta + rutaFinal, file.ToArray());
                await file.DisposeAsync();


                // GUARDADO DE IMAGEN
                if (imagen.Length > 0)
                {

                    if (idTipoMultimedia.Equals(1)
                        || idTipoMultimedia.Equals(2)
                        || idTipoMultimedia.Equals(3))
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"), nombreArchivoImagen);
                    }
                    else
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivoImagen);
                    }

                    //rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivoImagen);
                    await System.IO.File.WriteAllBytesAsync(ruta + rutaFinal, imagen.ToArray());
                    await imagen.DisposeAsync();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> MultimediaActualiza()
        {
            try
            {
                int idMultimedia = int.Parse(Request.Form["idMultimedia"]);
                string titulo = Request.Form["titulo"];
                string descripcion = Request.Form["descripcion"];
                int idOrigen = int.Parse(Request.Form["idOrigen"]);
                int idTipoMultimedia = int.Parse(Request.Form["idTipoMultimedia"]);
                int idUsuario = int.Parse(Request.Form["idUsuario"]);
                int idTipoArchivo = int.Parse(Request.Form["idTipoArchivo"]);
                int orden = int.Parse(Request.Form["orden"]);
                string fecha = Request.Form["fecha"].ToString();

                //string fileName = "";
                //string nombreArchivo = "";
                //int cambiaArchivo = 0;
                //if (Request.Form.Files.Count > 0)
                //{
                //    fileName = Path.GetFileNameWithoutExtension(Request.Form.Files[0].FileName);
                //    nombreArchivo = fileName + "_" + DateTime.Now.ToString("HH_mm_ss").ToString() + Path.GetExtension(Request.Form.Files[0].FileName);
                //    cambiaArchivo = 1;
                //}

                MemoryStream file = new();
                MemoryStream imagen = new();

                int cambiaArchivo = 0;
                int cambiaImagen = 0;

                string nombreArchivo = string.Empty;
                string fileNameImage = string.Empty;

                string nombreArchivoImagen = string.Empty;
                string extensionImagen = string.Empty;

                if (Request.Form.Files.GetFile("archivo") != null)
                {
                    string fileName = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("archivo").FileName);
                    nombreArchivo = fileName + Path.GetExtension(Request.Form.Files.GetFile("archivo").FileName);//+ "_" + DateTime.Now.ToString("HH_mm_ss").ToString() + Path.GetExtension(Request.Form.Files.GetFile("archivo").FileName);
                    await Request.Form.Files.GetFile("archivo").CopyToAsync(file);
                    cambiaArchivo++;
                }

                if (Request.Form.Files.GetFile("imagen") != null)
                {
                    await Request.Form.Files.GetFile("imagen").CopyToAsync(imagen);
                    fileNameImage = Request.Form.Files.GetFile("imagen").FileName;
                    nombreArchivoImagen = Path.GetFileNameWithoutExtension(fileNameImage);// + "_" + DateTime.Now.ToString("HH_mm_ss").ToString();
                    extensionImagen = Path.GetExtension(fileNameImage);

                    nombreArchivoImagen += extensionImagen;
                    cambiaImagen++;
                }


                var json = new
                {
                    idMultimedia,
                    idTipoMultimedia,
                    idOrigen,
                    titulo,
                    descripcion,
                    nombreArchivoImagen,
                    cambiaImagen,
                    idTipoArchivo,
                    idUsuario,
                    nombreArchivo,
                    cambiaArchivo,
                    orden,
                    fecha
                };

                var dataAnterior = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(json), "dbo.Multimedia_Recupera");


                // ACTUALIZA ARCHIVO
                var result = await new AccesoDB(_connectionString).ExecuteQueryAsync(JsonConvert.SerializeObject(json), "dbo.Multimedia_Actualiza");
                if (!JObject.Parse(result)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(result)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = string.Empty;

                if (idTipoMultimedia.Equals(1)
                        || idTipoMultimedia.Equals(2)
                        || idTipoMultimedia.Equals(3))
                {
                    directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"));
                }
                else
                {
                    directorio = Path.Combine("\\", _configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString() + "\\");
                }


                if (!Directory.Exists(ruta + directorio))
                {
                    Directory.CreateDirectory(ruta + directorio);
                }


                if (Request.Form.Files.GetFile("archivo") != null)
                {    /**
                     * 
                     * LA RUTA ES ==> origenDelSitioWebEnC\carpetaArchivos\idTipoMultimedia\nombreArchivo
                     * 
                     * **/
                    var rutaFinal = string.Empty;

                    if (idTipoMultimedia.Equals(1)
                        || idTipoMultimedia.Equals(2)
                        || idTipoMultimedia.Equals(3))
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"), nombreArchivo);
                    }
                    else
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivo);
                    }

                    try
                    {
                        if (!string.IsNullOrEmpty(JObject.Parse(dataAnterior)["archivo"].ToString()))
                        {
                            if (System.IO.File.Exists(ruta + directorio + JObject.Parse(dataAnterior)["archivo"].ToString()))
                            {
                                System.IO.File.Delete(ruta + directorio + JObject.Parse(dataAnterior)["archivo"].ToString());
                            }
                        }
                    }
                    catch (Exception)
                    {
                        //
                    }


                    await System.IO.File.WriteAllBytesAsync(ruta + rutaFinal, file.ToArray());
                    await file.DisposeAsync();
                }

                if (Request.Form.Files.GetFile("imagen") != null)
                {    /**
                     * 
                     * LA RUTA ES ==> origenDelSitioWebEnC\carpetaArchivos\idTipoMultimedia\nombreArchivo
                     * 
                     * **/
                    var rutaFinal = string.Empty;
                    if (idTipoMultimedia.Equals(1)
                        || idTipoMultimedia.Equals(2)
                        || idTipoMultimedia.Equals(3))
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"), nombreArchivoImagen);
                    }
                    else
                    {
                        rutaFinal = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), idTipoMultimedia.ToString(), nombreArchivoImagen);
                    }

                    try
                    {
                        if (!string.IsNullOrEmpty(JObject.Parse(dataAnterior)["imagen"].ToString()))
                        {
                            if (System.IO.File.Exists(ruta + directorio + JObject.Parse(dataAnterior)["imagen"].ToString()))
                            {
                                System.IO.File.Delete(ruta + directorio + JObject.Parse(dataAnterior)["imagen"].ToString());
                            }
                        }
                    }
                    catch (Exception)
                    {
                        //
                    }

                    await System.IO.File.WriteAllBytesAsync(ruta + rutaFinal, imagen.ToArray());
                    await imagen.DisposeAsync();
                }


                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult MultimediaConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Consulta");

                var directorio = string.Empty;
                if (body["idTipoMultimedia"].ToString().Equals("1")
                    || body["idTipoMultimedia"].ToString().Equals("2")
                    || body["idTipoMultimedia"].ToString().Equals("3"))
                {
                    directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _webHostEnvironment.WebRootPath + "\\", _configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos") + "\\");
                }
                else
                {
                    directorio = Path.Combine(_webHostEnvironment.WebRootPath + "\\", _configuration.GetValue<string>("Rutas:Multimedia"), body["idTipoMultimedia"].ToString() + "\\");
                }

                return Ok(new
                {
                    archivos = data.IsNullOrEmpty() ? "" : data,
                    ruta = directorio.Replace("\\", "/")
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message.ToString());
            }
        }

        [HttpPost]
        public IActionResult MultimediaRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Recupera");

                var directorio = string.Empty;
                if (body["idTipoMultimedia"].ToString().Equals("1")
                    || body["idTipoMultimedia"].ToString().Equals("2")
                    || body["idTipoMultimedia"].ToString().Equals("3"))
                {
                    directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _webHostEnvironment.WebRootPath + "\\", _configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos") + "\\");
                }
                else
                {
                    directorio = Path.Combine(_webHostEnvironment.WebRootPath + "\\", _configuration.GetValue<string>("Rutas:Multimedia"), body["idTipoMultimedia"].ToString() + "\\");
                }

                return Ok(new
                {
                    multimedia = data,
                    ruta = directorio.Replace("\\", "/")
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message.ToString());
            }
        }

        [HttpPost]
        public IActionResult MultimediaElimina([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Recupera");

                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), body["idTipoMultimedia"].ToString() + "\\");

                var ruta = _webHostEnvironment.WebRootPath + "\\";

                var a = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Elimina");
                if (!JObject.Parse(a)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(a)["resultado"].ToString());
                }

                try
                {

                    System.IO.File.Delete(ruta + directorio + JObject.Parse(data)["archivo"].ToString());
                    if (!JObject.Parse(data)["imagen"].ToString().IsNullOrEmpty())
                    {
                        System.IO.File.Delete(ruta + directorio + JObject.Parse(data)["imagen"].ToString());
                    }
                }
                catch (Exception)
                {
                    //
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.InnerException.ToString());
            }
        }


        [HttpPost]
        public IActionResult MultimediaProductosInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.MultimediaProducto_Inserta");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        public async Task<IActionResult> Imagen()
        {
            try
            {

                MemoryStream file = new();
                if (Request.Form.Files.GetFile("archivo") == null)
                {
                    return BadRequest("Error, se requiere un archivo");
                }
                string fileName = Request.Form.Files.GetFile("archivo").FileName;
                await Request.Form.Files.GetFile("archivo").CopyToAsync(file);


                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:ImagenesTiny"));
                if (!Directory.Exists(ruta + directorio))
                {
                    Directory.CreateDirectory(ruta + directorio);
                }

                await System.IO.File.WriteAllBytesAsync(ruta + directorio + fileName, file.ToArray());
                await file.DisposeAsync();

                return Ok(new
                {
                    rutaServidor = (directorio + fileName).Replace("\\", "/")
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
