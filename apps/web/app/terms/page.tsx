export const metadata = {
  title: "Terms • TonStars",
  description: "Terms of Use / Условия использования",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-neutral-200">
      <h1 className="text-3xl font-semibold mb-6">Terms of Use / Условия использования</h1>

      {/* RU */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-3">Условия использования (RU)</h2>
        <p className="opacity-80 mb-4">Последнее обновление: 01.06.2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Описание платформы</h3>
        <p className="mb-3">
          TonStars — интерфейс для покупки Telegram Stars за TON. Операции совершаются через
          смарт-контракты/платёжные провайдеры в сети TON. Мы не храним средства, сделки
          необратимы после подтверждения в сети.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Доступ и возраст</h3>
        <p className="mb-3">Сервисом могут пользоваться лица 18+. Используя Сервис, вы подтверждаете это.</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. Ответственность пользователя</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Храните приватные ключи/сид-фразы в безопасности. Мы не восстанавливаем кошельки.</li>
          <li>Проверяйте получателя и сумму перед подтверждением транзакции.</li>
          <li>Соблюдайте местное законодательство и налоговые обязанности.</li>
          <li>Запрещены незаконная деятельность, мошенничество, нарушение IP-прав, манипулирование рынком и т.д.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Комиссии</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Сетевые комиссии TON оплачиваются пользователем и не контролируются нами.</li>
          <li>Платформенные сборы (если применимы) отображаются до подтверждения и не возвращаются.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. Отказ от гарантий</h3>
        <p className="mb-3">
          Сервис предоставляется «как есть». Мы не гарантируем бесперебойность, отсутствие уязвимостей
          смарт-контрактов или рост стоимости цифровых активов.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Ограничение ответственности</h3>
        <p className="mb-3">
          В пределах, допустимых законом, мы не несем ответственности за косвенные/случайные убытки
          (потерю прибыли, данных и т.п.). Совокупная ответственность ограничена уплаченными нам
          комиссиями за последние 12 месяцев.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Прекращение доступа</h3>
        <p className="mb-3">
          Мы можем приостановить или прекратить доступ при нарушении Условий. Вы можете перестать
          пользоваться сервисом в любой момент; владение средствами в кошельке не затрагивается.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Изменения</h3>
        <p className="mb-3">Мы можем обновлять Условия. Новая редакция публикуется на этой странице.</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">9. Право и споры</h3>
        <p className="mb-3">
          Применимое право и порядок разрешения споров определяется юрисдикцией оператора сервиса.
          По возможности споры подлежат разрешению через арбитраж, если это не запрещено законом.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">10. Контакты</h3>
        <p>support@tonstars.io</p>
      </section>

      <hr className="border-neutral-700 my-10" />

      {/* EN */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Terms of Use (EN)</h2>
        <p className="opacity-80 mb-4">Last updated: 01 Jun 2025</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">1. Platform</h3>
        <p className="mb-3">
          TonStars is an interface to buy Telegram Stars with TON. Transactions occur via
          smart contracts/payment providers on the TON network. We do not hold funds; on-chain
          transactions are final once confirmed.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">2. Access & Age</h3>
        <p className="mb-3">You must be at least 18 years old to use the Service.</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">3. User Responsibilities</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Keep private keys/seed phrases secure. We cannot recover wallets.</li>
          <li>Verify recipient and amount before confirming a transaction.</li>
          <li>Comply with your local laws and tax obligations.</li>
          <li>No illegal activity, fraud, IP infringement, market manipulation, etc.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">4. Fees</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>TON network fees are paid by the user and are outside our control.</li>
          <li>Any platform fees (if applicable) are shown pre-confirmation and are non-refundable.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-2">5. No Warranty</h3>
        <p className="mb-3">
          The Service is provided “as is”. We don’t guarantee uninterrupted operation, absence of
          smart-contract vulnerabilities, or any asset value.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">6. Liability</h3>
        <p className="mb-3">
          To the fullest extent permitted by law, we are not liable for indirect/incidental damages.
          Aggregate liability is limited to fees paid to us in the prior 12 months.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">7. Termination</h3>
        <p className="mb-3">
          We may suspend/terminate access for violations. You may stop using the Service at any time;
          assets in your wallet remain under your control.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">8. Changes</h3>
        <p className="mb-3">We may update these Terms. The current version is posted on this page.</p>

        <h3 className="text-xl font-semibold mt-6 mb-2">9. Governing Law & Disputes</h3>
        <p className="mb-3">
          Governing law and dispute venue follow the operator’s jurisdiction. Where allowed, disputes
          shall be resolved by binding arbitration.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-2">10. Contact</h3>
        <p>support@tonstars.io</p>
      </section>
    </main>
  );
}
