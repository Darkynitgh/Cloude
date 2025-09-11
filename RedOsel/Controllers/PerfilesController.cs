using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class PerfilesController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        [AllowAnonymous]
        [HttpGet]
        [Route("/[controller]/Perfiles")]
        [Route("~/Distribuidores/Perfiles")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Perfiles()
        {
            ViewBag.Title = Request.Path.Value.ToString().Contains("Distribuidores") ? "Perfiles Distribuidor" : "Perfiles Internos";
            ViewBag.tipo = Request.Path.Value.ToString().Contains("Distribuidores") ? 1 : 0;
            return View();
        }

        #region Metodos

        [HttpPost]
        public IActionResult GetPerfiles([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Perfil_Consulta_JSON");
                return Ok(res); // Return 200 OK with the result
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message); // Return 400 Bad Request with error message
            }
        }

        [HttpPost]
        public IActionResult GetPerfil([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).GetPerfil(int.Parse(body["idPerfil"].ToString()));
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult PerfilElimina([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).PerfilElimina(int.Parse(body["idPerfil"].ToString()));

                if (!res.IsNullOrEmpty())
                {
                    return BadRequest(res);
                }
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult PerfilInserta([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).PerfilInserta(body["descripcion"].ToString(), int.Parse(body["idEstatus"].ToString()), int.Parse(body["tipo"].ToString()));
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult PerfilActualiza([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).PerfilActualiza(int.Parse(body["idPerfil"].ToString()), body["descripcion"].ToString(), int.Parse(body["idEstatus"].ToString()));
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ConsultaAccesos([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ConsultaAccesos(int.Parse(body["idPerfil"].ToString()), 1, int.Parse(body["tipo"].ToString()));
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult OpcionesInserta([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).OpcionesInserta(int.Parse(body["idPerfil"].ToString()), body["opciones"].ToString(),
                    int.Parse(body["idUsuario"].ToString()), 1);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Metodos
    }
}
