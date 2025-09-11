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
    public class ProductosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public ProductosController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }



        [HttpPost]
        public IActionResult ProductosConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ProductoInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Inserta");

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
        public IActionResult ProductoActualiza([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Actualiza");

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
        public IActionResult ProductoElimina([FromBody] JsonObject body)
        {
            try
            {
                var dataProducto = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Recupera");

                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Elimina");

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
                        var directorioYArchivo = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"), item["archivo"].ToString());

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
        public IActionResult ProductoRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Productos_Recupera");

                var directorio = Path.Combine("\\", _configuration.GetValue<string>("Rutas:Multimedia"), _configuration.GetValue<string>("Rutas:Productos"));
                var a = JObject.Parse(data);
                a.Add("directorio", directorio);

                return Ok(a.ToString());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        public IActionResult FamiliasConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).FamiliasConsulta(int.Parse(body["idTipoNaturaleza"].ToString()));
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
