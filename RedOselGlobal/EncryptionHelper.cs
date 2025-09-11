using System.Security.Cryptography;
using System.Text;

namespace RedOselGlobal
{
    public class EncryptionHelper
    {
        private static readonly string Key = "bcc4633a9983d7259d94b07e0367a90c"; // 32 bytes for AES-256

        public static (string CipherText, string Tag, string IV) Encrypt(string plainText)
        {
            using var aes = new AesGcm(Encoding.UTF8.GetBytes(Key), 16);
            var iv = new byte[12]; // AES-GCM requires 96-bit IV
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(iv);

            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            var cipherTextBytes = new byte[plainTextBytes.Length];
            var tagBytes = new byte[16]; // 128-bit authentication tag

            aes.Encrypt(iv, plainTextBytes, cipherTextBytes, tagBytes);

            return (
                Convert.ToBase64String(cipherTextBytes),
                Convert.ToBase64String(tagBytes),
                Convert.ToBase64String(iv)
            );
        }

        public static string Decrypt(string cipherText, string tag, string iv)
        {
            using var aes = new AesGcm(Encoding.UTF8.GetBytes(Key), 16);

            var ivBytes = Convert.FromBase64String(iv);
            var cipherTextBytes = Convert.FromBase64String(cipherText);
            var tagBytes = Convert.FromBase64String(tag);
            var plainTextBytes = new byte[cipherTextBytes.Length];

            aes.Decrypt(ivBytes, cipherTextBytes, tagBytes, plainTextBytes);

            return Encoding.UTF8.GetString(plainTextBytes);
        }
    }
}
