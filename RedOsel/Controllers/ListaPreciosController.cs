using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class ListaPreciosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public ListaPreciosController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }



        [HttpPost]
        public IActionResult Consulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult Inserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Inserta");

                if (int.TryParse(JObject.Parse(data)["resultado"].ToString(), out int idProducto))
                {
                    return Ok(idProducto);
                }
                else
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult Actualiza([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Actualiza");

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
        public IActionResult Elimina([FromBody] JsonObject body)
        {
            try
            {
                var dataProducto = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Recupera");

                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var array = JArray.Parse(JObject.Parse(dataProducto)["multimedia"].ToString());
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

                return Ok();
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
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Recupera");

                var directorio = Path.Combine("\\", _configuration.GetValue<string>("Rutas:Multimedia"));
                var a = JObject.Parse(data);
                a.Add("directorio", directorio);

                return Ok(a.ToString());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
