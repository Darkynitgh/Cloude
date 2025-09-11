using System.Net;
using System.Net.Mail;

namespace RedOselGlobal
{
    public class EnvioCorreo
    {
        public static string EnviarCorreo(string strtoAddress, string Body, string Titulo, string connectionString, string pathArchivo = "")
        {

            var configuracion = new AccesoDB(connectionString).RecuperaConfiguracionCorreoNotificaciones();
            string mensaje = "";
            string strHost = configuracion[0];
            string strFromAddress = configuracion[1];
            string strPort = configuracion[2];
            string fromPassword = configuracion[3];
            string strSSL = configuracion[4];

            string alias = "Pinturas Osel";
            MailAddress fromAddress = new(strFromAddress, alias);
            MailMessage message = new();
            message.From = fromAddress;
            message.Subject = Titulo;
            message.Body = Body;
            message.IsBodyHtml = true;

            if (pathArchivo != "" && pathArchivo != null)
            {
                message.Attachments.Add(new Attachment(pathArchivo));
            }

            //Enviar a varios correos
            string[] destinatario = strtoAddress.Split(';');
            foreach (string destino in destinatario)
            {
                message.To.Add(new MailAddress(destino));
            }

            var smtp = new SmtpClient
            {
                Host = strHost,
                Port = Convert.ToInt32(strPort),
                EnableSsl = Convert.ToBoolean(strSSL),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(fromAddress.Address, fromPassword)
            };
            try
            {
                smtp.Send(message);
                return string.Empty;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
