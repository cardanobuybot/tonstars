export const metadata = {
  title: "Privacy • TonStars",
  description: "Privacy Policy / Политика конфиденциальности",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-neutral-200">
      <h1 className="text-3xl font-semibold mb-6">Privacy Policy / Политика конфиденциальности</h1>

      {/* RU */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">Политика конфиденциальности (RU)</h2>
        <p className="opacity-80 mb-4">Последнее обновление: 01.06.2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Введение</h3>
        <p className="mb-3">
          Эта Политика описывает, какие данные обрабатывает TonStars («Сервис») и зачем. Мы
          строим сервис как некастодиальный — платежи проходят в сети TON, мы не храним ваши
          средства и не связываем транзакции с персональными идентификаторами.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Какие данные мы используем</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <b>Доступ через Telegram/кошелёк TON.</b> Мы не собираем сид-фразы/приватные ключи и
            не связываем аккаунты с IP/устройством.
          </li>
          <li>
            <b>История транзакций.</b> Записывается публично в блокчейне TON. Мы используем ссылки
            на события сети только для проверки факта оплаты.
          </li>
          <li>
            <b>Настройки уведомлений/интерфейса.</b> Могут храниться локально в вашем браузере
            (cookies/localStorage).
          </li>
          <li>
            <b>Анонимная статистика.</b> В целях анти-абьюза можем временно обрабатывать
            обезличённые технические сигнатуры (например, user-agent) не дольше 6 месяцев.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Как мы используем данные</h3>
        <p className="mb-3">
          Для работы интерфейса, предотвращения злоупотреблений и соблюдения применимого права.
          Мы не продаём данные и не строим профили пользователей.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. С кем делимся</h3>
        <p className="mb-3">
          Мы не передаём персональные данные третьим лицам. Сведения о транзакциях доступны
          публично в блокчейне TON. По законным запросам можем раскрыть агрегированные метрики,
          не позволяющие де-анонимизацию.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. Ваши права</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Прекратить использование сервиса в любой момент.</li>
          <li>Отключить cookies в браузере (часть функций может работать иначе).</li>
          <li>Если вы в ЕС: вы вправе возражать против обработки, отозвать согласие, задать вопросы.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Безопасность</h3>
        <p className="mb-3">
          Используйте только доверенные кошельки TON, бережно храните сид-фразу, не подписывайте
          непонятные транзакции.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Изменения политики</h3>
        <p className="mb-3">
          Мы можем обновлять эту Политику. Актуальная версия публикуется на этой странице с новой датой.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Контакты</h3>
        <p>По вопросам приватности: support@tonstars.io</p>
      </section>

      <hr className="border-neutral-700 my-10" />

      {/* EN */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Privacy Policy (EN)</h2>
        <p className="opacity-80 mb-4">Last updated: 01 Jun 2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Introduction</h3>
        <p className="mb-3">
          This Policy explains what data TonStars (“Service”) processes and why. The Service is
          non-custodial: payments occur on the TON blockchain; we don’t hold your funds or link
          transactions to personal identifiers.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Data we use</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <b>Login via Telegram/TON wallet.</b> We don’t collect seed phrases/private keys and
            don’t bind accounts to IP/devices.
          </li>
          <li>
            <b>Transaction history.</b> Public on TON. We only reference on-chain events to verify payment.
          </li>
          <li>
            <b>Preferences.</b> Stored locally (cookies/localStorage) to improve UX.
          </li>
          <li>
            <b>Anonymous stats.</b> Anti-abuse technical telemetry may be processed for up to 6 months.
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. How we use it</h3>
        <p className="mb-3">
          Operating the UI, abuse prevention, and legal compliance. We do not sell data or build user profiles.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Sharing</h3>
        <p className="mb-3">
          No personal data is shared with third parties. TON transactions are public. Lawful requests may be
          answered with aggregated non-identifying metrics.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. Your rights</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Stop using the Service at any time.</li>
          <li>Disable cookies (some features may change behavior).</li>
          <li>If in the EU: you may object, withdraw consent, and ask questions.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Security</h3>
        <p className="mb-3">
          Use reputable TON wallets, protect your seed phrase, and avoid signing unknown transactions.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Changes</h3>
        <p className="mb-3">
          We may update this Policy. The current version and date appear on this page.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Contact</h3>
        <p>Privacy questions: support@tonstars.io</p>
      </section>
    </main>
  );
}
