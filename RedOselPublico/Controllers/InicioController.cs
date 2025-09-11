using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOselPublico.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class InicioController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        //[Route("")]
        //[Route("Inicio")]
        [AllowAnonymous]
        public IActionResult Inicio()
        {
            //Response.Cookies.Delete("rsh_redOsel");
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("~/Recuperacion")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult RecuperacionContrasena()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult RestablecerContrasena([FromBody] JsonObject body)
        {
            var res = "";
            try
            {
                string token = Utils.EncrypytPassword(Guid.NewGuid().ToString());

                var js = new
                {
                    usuario = body["usuario"].ToString(),
                    token,
                    distribuidores = 1
                };
                var result = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Usuario_PeticionRestablecimiento_Contrasena_JSON");
                var jsRes = JObject.Parse(result);

                if (jsRes["mensaje"].ToString().Trim().ToLower() == "actualizado")
                {
                    var url = Utils.GetBaseUrl(this.HttpContext);
                    var bd = "<p> Estimado Sr. (a) " + jsRes["nombre"].ToString().Trim() + " </p></br>";
                    bd += "<p> Se recibió una solicitud de recuperación de contraseña para el usuario: " + body["usuario"].ToString().Trim() + ".</p>";
                    bd += "<p>En el siguiente link podrá restablecer su contraseña: <a href='" + url + "/Recuperacion/?token=" + token + "' ";
                    bd += "target='_blank'>De clic aquí para restablecer su contraseña.</a><br>Este link es válido por 30 minutos.</p>";
                    bd += "<p>Este mensaje fue generado de manera automática por el sistema de Pinturas Osel.</p>";
                    bd += "<p>En caso usted no haya realizado esta acción, reportarlo con su administrador de sistema.</p>";
                    EnvioCorreo.EnviarCorreo(jsRes["correo_electronico"].ToString().Trim(), bd, "Restablecimiento de contraseña Pinturas Osel", _connectionString);

                    return Ok();
                }
                else
                {
                    throw new Exception(jsRes["mensaje"].ToString().Trim().ToLower());
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult CambiaContrasena([FromBody] JsonObject body)
        {
            var tok = "";
            try
            {
                string token = body["token"].ToString();
                string contrasena = body["contrasena"].ToString();
                var password = Utils.EncrypytPassword(contrasena);

                var js = new
                {
                    token,
                    password,
                    distribuidores = 1
                };
                var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Usuario_RestableceContrasena_JSON");
                var jsResult = JObject.Parse(res);

                if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("cambiado"))
                {
                    return Ok();
                }
                else if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("expirado"))
                {
                    return BadRequest("Solicitud expirada, realice una nueva solicitud");
                }
                else if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("noexiste"))
                {
                    return BadRequest("Solicitud inválida");
                }
                else
                {
                    return BadRequest("Error de solicitud");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Route("~/ActualizaC")]
        [HttpPost]
        public IActionResult ActualizaPorExpiracion([FromBody] JsonObject body)
        {
            var tok = "";
            try
            {
                string contrasena = body["contrasena"].ToString();
                string token = body["token"].ToString();
                string password = Utils.EncrypytPassword(contrasena);
                string correo = body["correo"].ToString();

                var a = new
                {
                    token,
                    contrasena = password,
                    soloContrasena = 1,
                    correo
                };
                var result = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(a), "dbo.UsuariosCiac_Actualiza");

                if (!JObject.Parse(result)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(result)["resultado"].ToString());
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
