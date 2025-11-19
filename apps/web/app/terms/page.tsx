// apps/web/app/terms/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Условия использования | TonStars',
  description:
    'Условия использования сервиса TonStars для покупки Telegram Stars за TON.',
  alternates: {
    languages: {
      ru: 'https://www.tonstars.io/terms',
      en: 'https://www.tonstars.io/en/terms',
      'x-default': 'https://www.tonstars.io/terms',
    },
  },
};

export default function TermsRuPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 16px 40px',
        maxWidth: 860,
        margin: '0 auto',
        color: '#e5edf5',
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Условия использования</h1>
      <div style={{ opacity: 0.7, marginBottom: 24, fontSize: 14 }}>
        Последнее обновление: 01.06.2025
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>1. Введение</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Эти Условия регулируют доступ и использование платформы{' '}
          <strong>TonStars</strong>. Если вы не согласны с Условиями, не
          используйте сервис.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>2. Описание платформы</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          TonStars — независимая платформа для покупки <strong>Telegram Stars</strong>{' '}
          за <strong>TON</strong>. Все транзакции происходят в сети TON. Платформа
          не хранит пользовательские средства и не является кастодиальным сервисом.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>3. Требования к пользователю</h2>
        <ul style={{ opacity: 0.9, lineHeight: 1.6, paddingLeft: 20 }}>
          <li>вам должно быть 18 лет и более;</li>
          <li>вы несёте ответственность за безопасность своих устройств и кошельков;</li>
          <li>
            вы обязуетесь соблюдать законы юрисдикции, в которой находитесь, при
            использовании сервиса.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>4. Обязанности пользователя</h2>
        <ul style={{ opacity: 0.9, lineHeight: 1.6, paddingLeft: 20 }}>
          <li>не использовать сервис для незаконной деятельности;</li>
          <li>не распространять вредоносное ПО и не пытаться взломать сервис;</li>
          <li>не совершать мошенничество и манипуляции с транзакциями;</li>
          <li>не ухудшать работу платформы и инфраструктуры.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>5. Транзакции и риски</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Операции в сети TON необратимы. Платформа не может отменить или вернуть
          платёж после его подтверждения сетью. Вы обязаны проверять адреса и
          суммы до отправки транзакции.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>6. Комиссии</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Цена и комиссия (включая нашу наценку, например, до 3%) отображаются до
          оплаты. Дополнительно могут взиматься сетевые комиссии сети TON.
          Комиссии не подлежат возврату, за исключением явно предусмотренных
          случаев (например, технический сбой на стороне сервиса при котором
          средства автоматически возвращаются).
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>7. Ограничение ответственности</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Сервис предоставляется «как есть». Мы не гарантируем бесперебойную
          работу и отсутствие ошибок. Мы не несём ответственности за прямые,
          косвенные или косвенно-сопутствующие убытки, включая потерю прибыли,
          данных, а также за действия третьих лиц и внешних сервисов (кошельков,
          бирж, провайдеров).
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>8. Возмещение убытков</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Пользователь соглашается возместить Платформе убытки, понесённые в
          результате нарушения Условий или применимого законодательства, включая
          претензии третьих лиц и расходы на юридическую защиту.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>9. Прекращение доступа</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Мы можем приостановить или ограничить доступ к сервису без
          предварительного уведомления, если усмотрим нарушения Условий,
          подозрительную активность или требования регуляторов/платформ.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>10. Изменения</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Актуальная версия Условий всегда доступна на этой странице. Дата
          последнего обновления указана выше. Продолжая использовать сервис после
          обновления, вы соглашаетесь с новой редакцией Условий.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>11. Применимое право</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          К настоящим Условиям применяется право юрисдикции владельца Платформы.
          Споры подлежат рассмотрению в компетентном суде по месту регистрации
          владельца сервиса, если иное не предусмотрено императивными нормами
          права.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 8 }}>12. Контакты</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Telegram: <a href="https://t.me/tonstars_support">@tonstars_support</a>
          <br />
          Сайт: <a href="https://www.tonstars.io">tonstars.io</a>
        </p>
      </section>
    </main>
  );
}
