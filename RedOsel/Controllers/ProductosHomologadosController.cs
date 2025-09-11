using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    public class ProductosHomologadosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public ProductosHomologadosController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;

        }


        [HttpPost]
        public IActionResult Consulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ProductosHomologados_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult Recupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ProductosHomologados_Recupera");
                var js = JObject.Parse(data);

                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ProductosHomologados");
                js.Add("directorio", directorio);

                return Ok(JsonConvert.SerializeObject(js));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Inserta()
        {
            try
            {
                int idProductoHomologado = 0;
                var fileMini = Request.Form.Files.GetFile("logoMini");
                string nombreMini = string.Empty;
                string extensionMini = string.Empty;

                nombreMini = Path.GetFileNameWithoutExtension(fileMini.FileName) + DateTime.Now.ToString("HH_mm_ss");
                extensionMini = Path.GetExtension(fileMini.FileName);

                var file = Request.Form.Files.GetFile("logo");
                string nombre = string.Empty;
                string extension = string.Empty;

                nombre = Path.GetFileNameWithoutExtension(file.FileName) + DateTime.Now.ToString("HH_mm_ss");
                extension = Path.GetExtension(file.FileName);

                var js = new
                {
                    nombre = Request.Form["nombre"].ToString(),
                    descripcion = Request.Form["descripcion"].ToString(),
                    logo = nombre + extension,
                    logoMini = nombreMini + extensionMini,
                    publicado = bool.Parse(Request.Form["publicado"].ToString()),
                    idUsuario = int.Parse(Request.Form["idUsuario"].ToString())
                };
                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.ProductosHomologados_Inserta");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    if (int.TryParse(JObject.Parse(data)["resultado"].ToString(), out int idPH))
                    {
                        idProductoHomologado = idPH;
                    }
                    else
                    {
                        throw new Exception(JObject.Parse(data)["resultado"].ToString());
                    }
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ProductosHomologados");

                if (!Directory.Exists(ruta + directorio))
                {
                    Directory.CreateDirectory(ruta + directorio);
                }

                var rutaFinal = ruta + directorio + nombre + extension;
                var rutaFinalMini = ruta + directorio + nombreMini + extensionMini;

                var a = new MemoryStream();
                await file.CopyToAsync(a);
                await System.IO.File.WriteAllBytesAsync(rutaFinal, a.ToArray());
                await a.DisposeAsync();


                var b = new MemoryStream();
                await fileMini.CopyToAsync(b);
                await System.IO.File.WriteAllBytesAsync(rutaFinalMini, b.ToArray());
                await b.DisposeAsync();


                return Ok(idProductoHomologado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> Actualiza()
        {
            try
            {
                MemoryStream file = new();
                MemoryStream fileMini = new();
                string nombre = string.Empty;
                string extension = string.Empty;

                string nombreMini = string.Empty;
                string extensionMini = string.Empty;

                if (Request.Form.Files.Count > 0)
                {
                    if (Request.Form.Files.GetFile("logoMini") != null)
                    {
                        await Request.Form.Files.GetFile("logoMini").OpenReadStream().CopyToAsync(fileMini);
                        nombreMini = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("logoMini").FileName) + DateTime.Now.ToString("HH_mm_ss");
                        extensionMini = Path.GetExtension(Request.Form.Files.GetFile("logoMini").FileName);
                    }

                    if (Request.Form.Files.GetFile("logo") != null)
                    {
                        await Request.Form.Files.GetFile("logo").OpenReadStream().CopyToAsync(file);
                        nombre = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("logo").FileName) + DateTime.Now.ToString("HH_mm_ss");
                        extension = Path.GetExtension(Request.Form.Files.GetFile("logo").FileName);
                    }
                }

                var j = new
                {
                    id = int.Parse(Request.Form["idProductoHomologado"].ToString())
                };
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(j), "dbo.ProductosHomologados_Recupera");

                var js = new
                {
                    idProductoHomologado = int.Parse(Request.Form["idProductoHomologado"].ToString()),
                    nombre = Request.Form["nombre"].ToString(),
                    descripcion = Request.Form["descripcion"].ToString(),
                    logo = !nombre.IsNullOrEmpty() ? nombre + extension : Request.Form["log"].ToString(),
                    logoMini = !nombreMini.IsNullOrEmpty() ? nombreMini + extensionMini : Request.Form["logMini"].ToString(),
                    publicado = bool.Parse(Request.Form["publicado"].ToString()),
                    idUsuario = int.Parse(Request.Form["idUsuario"].ToString())
                };

                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.ProductosHomologados_Actualiza");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }


                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ProductosHomologados");

                if (file.Length > 0)
                {
                    var ruta = _webHostEnvironment.WebRootPath;
                    if (!Directory.Exists(ruta + directorio))
                    {
                        Directory.CreateDirectory(ruta + directorio);
                    }

                    var rutaFinal = ruta + directorio + nombre + extension;

                    await System.IO.File.WriteAllBytesAsync(rutaFinal, file.ToArray());
                    await file.DisposeAsync();

                    try
                    {
                        rutaFinal = ruta + directorio + JObject.Parse(dataRs)["logo"].ToString();
                        System.IO.File.Delete(rutaFinal);
                    }
                    catch (Exception)
                    {
                        //
                    }
                }
                else
                {
                    file.Dispose();
                }

                if (fileMini.Length > 0)
                {
                    var ruta = _webHostEnvironment.WebRootPath;
                    if (!Directory.Exists(ruta + directorio))
                    {
                        Directory.CreateDirectory(ruta + directorio);
                    }

                    var rutaFinal = ruta + directorio + nombreMini + extensionMini;

                    await System.IO.File.WriteAllBytesAsync(rutaFinal, fileMini.ToArray());
                    await fileMini.DisposeAsync();

                    try
                    {
                        var rutaFinalMini = ruta + directorio + JObject.Parse(dataRs)["logo_mini"].ToString();
                        System.IO.File.Delete(rutaFinalMini);
                    }
                    catch (Exception)
                    {
                        //
                    }
                }
                else
                {
                    fileMini.Dispose();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult Elimina([FromBody] JsonObject body)
        {
            try
            {
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ProductosHomologados_Recupera");
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductosHomologados_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:ProductosHomologados"));
                var rutaFinal = ruta + directorio + JObject.Parse(dataRs)["logo"].ToString();
                var rutaFinalMini = ruta + directorio + JObject.Parse(dataRs)["logo_mini"].ToString();

                try
                {
                    System.IO.File.Delete(rutaFinal);
                }
                catch (Exception)
                {
                    //
                }

                try
                {
                    System.IO.File.Delete(rutaFinalMini);
                }
                catch (Exception)
                {
                    //
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        public IActionResult RegistroConsulta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoRegistro_Consulta");
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult RegistroInserta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoRegistro_Inserta");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult RegistroActualiza([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoRegistro_Actualiza");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult RegistroElimina([FromBody] JsonObject body)
        {
            try
            {
                var js = new
                {
                    idOrigen = int.Parse(body["idProductoHomologadoRegistro"].ToString()),
                    idTipoMultimedia = 14
                };
                var data = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Multimedia_Consulta");

                var directorio = Path.Combine(_webHostEnvironment.WebRootPath + "\\", _configuration.GetValue<string>("Rutas:Multimedia"), "14" + "\\");


                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoRegistro_Elimina");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }

                if (!data.IsNullOrEmpty())
                {
                    var array = JArray.Parse(JObject.Parse(data).ToString());
                    var ruta = _webHostEnvironment.WebRootPath;
                    if (array.Count > 0)
                    {
                        foreach (var item in array)
                        {
                            var directorioYArchivo = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), item["id_tipo_multimedia"].ToString(), item["archivo"].ToString());

                            try
                            {
                                System.IO.File.Delete(ruta + directorioYArchivo);
                            }
                            catch (Exception)
                            {
                                //
                            }
                        }
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        public IActionResult ProductoAsociadoInserta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoProducto_Inserta");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ProductoAsociadoActualiza([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoProducto_Actualiza");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ProductoAsociadoElimina([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ProductoHomologadoProducto_Elimina");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
