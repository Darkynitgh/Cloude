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
    public class DicopintController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public DicopintController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }


        [HttpPost]
        public IActionResult Consulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.Dicopint_Consulta");
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
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.Dicopint_Recupera");
                var js = JObject.Parse(data);

                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:Dicopint");
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
                    descripcion = Request.Form["descripcion"].ToString(),
                    logo = nombre + extension,
                    publicado = bool.Parse(Request.Form["publicado"].ToString())
                };
                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.Dicopint_Inserta");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:Dicopint");

                if (!Directory.Exists(ruta + directorio))
                {
                    Directory.CreateDirectory(ruta + directorio);
                }

                var rutaFinal = ruta + directorio + nombre + extension;

                var a = new MemoryStream();
                await file.CopyToAsync(a);
                await System.IO.File.WriteAllBytesAsync(rutaFinal, a.ToArray());
                await a.DisposeAsync();

                return Ok();
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

                if (Request.Form.Files.Count > 0)
                {
                    if (Request.Form.Files.GetFile("logo") != null)
                    {
                        await Request.Form.Files.GetFile("logo").OpenReadStream().CopyToAsync(file);
                        nombre = Path.GetFileNameWithoutExtension(Request.Form.Files.GetFile("logo").FileName) + DateTime.Now.ToString("HH_mm_ss");
                        extension = Path.GetExtension(Request.Form.Files.GetFile("logo").FileName);
                    }
                }

                var j = new
                {
                    idDicopint = int.Parse(Request.Form["idDicopint"].ToString())
                };
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(j), "dbo.Dicopint_Recupera");

                var js = new
                {
                    idDicopint = int.Parse(Request.Form["idDicopint"].ToString()),
                    nombre = Request.Form["nombre"].ToString(),
                    descripcion = Request.Form["descripcion"].ToString(),
                    logo = !nombre.IsNullOrEmpty() ? nombre + extension : Request.Form["log"].ToString(),
                    publicado = bool.Parse(Request.Form["publicado"].ToString())
                };

                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.Dicopint_Actualiza");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }


                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:Dicopint");

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
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.Dicopint_Recupera");
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Dicopint_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Dicopint"));
                var rutaFinal = ruta + directorio + JObject.Parse(dataRs)["logo"].ToString();

                try
                {
                    System.IO.File.Delete(rutaFinal);
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
    }
}
