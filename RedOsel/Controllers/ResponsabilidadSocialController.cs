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
    [Route("Rs/[action]")]
    [EnableRateLimiting("GlobalLimiter")]
    [Authorize]
    public class ResponsabilidadSocialController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public ResponsabilidadSocialController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;

        }


        [HttpPost]
        public IActionResult RsConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ResponsabilidadSocial_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult RsRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ResponsabilidadSocial_Recupera");
                var js = JObject.Parse(data);

                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ResponsabilidadSocial");
                js.Add("directorio", directorio);

                return Ok(JsonConvert.SerializeObject(js));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> RsInserta()
        {
            try
            {
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
                    url = Request.Form["url"].ToString(),
                    publicado = bool.Parse(Request.Form["publicado"].ToString())
                };
                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.ResponsabilidadSocial_Inserta");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ResponsabilidadSocial");

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


                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> RsActualiza()
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
                    id = int.Parse(Request.Form["id"].ToString())
                };
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(j), "dbo.ResponsabilidadSocial_Recupera");

                var js = new
                {
                    id = int.Parse(Request.Form["id"].ToString()),
                    nombre = Request.Form["nombre"].ToString(),
                    descripcion = Request.Form["descripcion"].ToString(),
                    logo = !nombre.IsNullOrEmpty() ? nombre + extension : Request.Form["log"].ToString(),
                    logoMini = !nombreMini.IsNullOrEmpty() ? nombreMini + extensionMini : Request.Form["logMini"].ToString(),
                    url = Request.Form["url"].ToString(),
                    publicado = bool.Parse(Request.Form["publicado"].ToString())
                };

                var body = JsonConvert.SerializeObject(js);
                var data = new AccesoDB(_connectionString).ExecuteQuery(body, "dbo.ResponsabilidadSocial_Actualiza");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }


                var directorio = _configuration.GetValue<string>("Rutas:Multimedia") + _configuration.GetValue<string>("Rutas:ResponsabilidadSocial");

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
        public IActionResult RsElimina([FromBody] JsonObject body)
        {
            try
            {
                var dataRs = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ResponsabilidadSocial_Recupera");
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ResponsabilidadSocial_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var ruta = _webHostEnvironment.WebRootPath;
                var directorio = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:ResponsabilidadSocial"));
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

    }
}
