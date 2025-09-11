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
    [EnableRateLimiting("GlobalLimiter")]
    [Authorize]
    public class MarcasEquiposController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public MarcasEquiposController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }


        [HttpPost]
        public IActionResult Consulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.EquipoMarca_Consulta");
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
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.EquipoMarca_Recupera");
                var js = JObject.Parse(data);

                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:EquipoMarca");
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
                var file = Request.Form.Files.GetFile("logo");
                string nombre = string.Empty;
                string extension = string.Empty;

                nombre = Path.GetFileNameWithoutExtension(file.FileName) + DateTime.Now.ToString("HH_mm_ss");
                extension = Path.GetExtension(file.FileName);

                var js = new
                {
                    nombre = Request.Form["nombre"].ToString(),
                    logo = nombre + extension,
                    publicado = bool.Parse(Request.Form["publicado"].ToString()),
                    idUsuario = int.Parse(Request.Form["idUsuario"].ToString()),
                    orden = int.Parse(Request.Form["orden"].ToString())
                };
                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.EquipoMarca_Inserta");

                var json = JObject.Parse(data);
                if (int.TryParse(json["resultado"].ToString(), out int idEquipoMarca))
                {
                    var ruta = _webHostEnvironment.WebRootPath;
                    var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:EquipoMarca");

                    if (!Directory.Exists(ruta + directorio))
                    {
                        Directory.CreateDirectory(ruta + directorio);
                    }

                    var rutaFinal = ruta + directorio + nombre + extension;

                    var a = new MemoryStream();
                    await file.CopyToAsync(a);
                    await System.IO.File.WriteAllBytesAsync(rutaFinal, a.ToArray());
                    await a.DisposeAsync();

                    return Ok(idEquipoMarca);
                }
                else
                {
                    throw new Exception(json["resultado"].ToString());
                }
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
                string nombre = string.Empty;
                string extension = string.Empty;

                if (Request.Form.Files.GetFile("logo") != null)
                {
                    await Request.Form.Files.GetFile("logo").OpenReadStream().CopyToAsync(file);
                    nombre = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("logo").FileName) + DateTime.Now.ToString("HH_mm_ss");
                    extension = Path.GetExtension(Request.Form.Files.GetFile("logo").FileName);
                }

                var j = new
                {
                    idEquipoMarca = int.Parse(Request.Form["idEquipoMarca"].ToString())
                };
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(j), "dbo.EquipoMarca_Recupera");

                var js = new
                {
                    idEquipoMarca = int.Parse(Request.Form["idEquipoMarca"].ToString()),
                    nombre = Request.Form["nombre"].ToString(),
                    logo = !nombre.IsNullOrEmpty() ? nombre + extension : Request.Form["log"].ToString(),
                    publicado = bool.Parse(Request.Form["publicado"].ToString()),
                    idUsuario = int.Parse(Request.Form["idUsuario"].ToString()),
                    orden = int.Parse(Request.Form["orden"].ToString())
                };

                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.EquipoMarca_Actualiza");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }


                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:EquipoMarca");

                if (file.Length > 0)
                {
                    var ruta = _webHostEnvironment.WebRootPath;
                    if (!Directory.Exists(ruta + directorio))
                    {
                        Directory.CreateDirectory(ruta + directorio);
                    }

                    var rutaFinal = ruta + directorio + nombre + extension;

                    try
                    {
                        var rut = ruta + directorio + JObject.Parse(dataRs)["logo"].ToString();
                        System.IO.File.Delete(rut);
                    }
                    catch (Exception)
                    {
                        //
                    }

                    await System.IO.File.WriteAllBytesAsync(rutaFinal, file.ToArray());
                    await file.DisposeAsync();
                }
                else
                {
                    file.Dispose();
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
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.EquipoMarca_Recupera");
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.EquipoMarca_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:EquipoMarca"));

                var array = JArray.Parse(JObject.Parse(dataRs)["multimedia"].ToString());
                if (array.Count > 0)
                {
                    foreach (var item in array)
                    {
                        var directorioYArchivo = Path.Combine(directorio, item["archivo"].ToString());
                        var directorioEImagen = Path.Combine(directorio, item["imagen"].ToString());
                        try
                        {
                            System.IO.File.Delete(ruta + directorioYArchivo);

                            try
                            {
                                System.IO.File.Delete(ruta + directorioEImagen);
                            }
                            catch (Exception)
                            {
                                ///
                            }
                        }
                        catch (Exception)
                        {
                            //
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
    }
}
