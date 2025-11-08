export const metadata = {
  title: "Политика конфиденциальности / Privacy Policy — TonStars",
  description: "Политика конфиденциальности / Privacy Policy for TonStars",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-neutral-200">
      <h1 className="text-3xl font-semibold mb-6">
        Политика конфиденциальности / Privacy Policy
      </h1>

      {/* --- Russian Version --- */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">
          Политика конфиденциальности (RU)
        </h2>
        <p className="opacity-80 mb-4">Последнее обновление: 01.06.2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Введение</h3>
        <p className="mb-3">
          Эта Политика описывает обработку данных при использовании платформы{" "}
          <strong>TonStars</strong>. Используя Платформу, вы соглашаетесь с её
          условиями.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Какие данные мы используем</h3>
        <h4 className="font-semibold mt-4 mb-1">2.1. Данные аккаунта</h4>
        <p className="mb-2">
          Возможен вход через Telegram или подключение TON-кошелька. Мы не
          связываем эти данные и не храним IP/идентификаторы устройств.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.2. История транзакций</h4>
        <p className="mb-2">
          Все операции записываются в публичной сети TON. Средствами мы не
          управляем.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.3. Анонимная статистика</h4>
        <p className="mb-2">
          Можем собирать обезличенные техданные (устройство/браузер/страна) до 6
          месяцев для антифрода и улучшений.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.4. Cookies и local storage</h4>
        <p className="mb-2">
          Используем для языка интерфейса и статуса кошелька. Можно отключить в
          браузере (часть функций перестанет работать).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Как мы используем данные</h3>
        <p className="mb-2">
          Мы не храним средства и не связываем платежи с логином. Временно могут
          храниться только настройки интерфейса/языка.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Передача третьим лицам</h3>
        <p className="mb-2">
          Персональные данные не передаются. Операции публичны в TON. По законным
          запросам возможна передача агрегированной техстатистики.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. Ваши права</h3>
        <p className="mb-2">
          Так как персональные данные не хранятся — запрашивать удаление не
          требуется. Использование сервиса вы можете прекратить в любой момент.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Сторонние сервисы</h3>
        <p className="mb-2">
          Telegram, TON-кошельки (Tonkeeper, MyTonWallet, OpenMask),
          обозреватели, Vercel, Cloudflare — у каждого своя политика.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Безопасность</h3>
        <p className="mb-2">
          Мы применяем техмеры защиты. Платформа non-custodial: безопасность
          активов зависит от того, как вы храните кошелёк.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Международные передачи</h3>
        <p className="mb-2">
          Данные транзакций распределяются по узлам сети TON — это свойство
          блокчейна.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">9. Изменения</h3>
        <p className="mb-2">
          Актуальная версия доступна на этой странице. Дата обновления указана
          выше.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">10. Контакты</h3>
        <p>
          Telegram:{" "}
          <a href="https://t.me/tonstars_support">@tonstars_support</a> • Сайт:{" "}
          <a href="https://tonstars.io/">tonstars.io</a>
        </p>
      </section>

      <hr className="border-neutral-700 my-10" />

      {/* --- English Version --- */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          Privacy Policy (EN)
        </h2>
        <p className="opacity-80 mb-4">Last updated: 01 Jun 2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
        <p className="mb-3">
          This Policy describes how data is processed when using the{" "}
          <strong>TonStars</strong> platform. By using the Platform, you agree
          to its terms.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. What Data We Use</h3>
        <h4 className="font-semibold mt-4 mb-1">2.1. Account Data</h4>
        <p className="mb-2">
          Login via Telegram or by connecting a TON wallet is possible. We do
          not link these data or store IPs/device identifiers.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.2. Transaction History</h4>
        <p className="mb-2">
          All operations are recorded on the public TON network. We do not
          control user funds.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.3. Anonymous Statistics</h4>
        <p className="mb-2">
          We may collect anonymized technical data (device/browser/country) for
          up to 6 months for antifraud and improvements.
        </p>
        <h4 className="font-semibold mt-4 mb-1">2.4. Cookies and Local Storage</h4>
        <p className="mb-2">
          Used to store interface language and wallet connection status. You can
          disable cookies in your browser (some functions may stop working).
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. How We Use Data</h3>
        <p className="mb-2">
          We do not store funds or link payments to login data. Only interface or
          language preferences may be stored temporarily.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Data Sharing</h3>
        <p className="mb-2">
          No personal data is shared. Transactions are public on TON. Aggregated
          technical data may be shared upon lawful requests.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h3>
        <p className="mb-2">
          Since no personal data is stored, deletion requests are unnecessary.
          You can stop using the service at any time.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Third-Party Services</h3>
        <p className="mb-2">
          Telegram, TON wallets (Tonkeeper, MyTonWallet, OpenMask), explorers,
          Vercel, and Cloudflare each have their own privacy policies.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Security</h3>
        <p className="mb-2">
          We apply technical protection measures. The Platform is non-custodial:
          asset security depends on how you store your wallet.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. International Transfers</h3>
        <p className="mb-2">
          Transaction data is distributed across TON network nodes — this is an
          inherent property of blockchain.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">9. Changes</h3>
        <p className="mb-2">
          The current version is available on this page. The update date is
          shown above.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">10. Contacts</h3>
        <p>
          Telegram:{" "}
          <a href="https://t.me/tonstars_support">@tonstars_support</a> •
          Website: <a href="https://tonstars.io/">tonstars.io</a>
        </p>
      </section>
    </main>
  );
}
