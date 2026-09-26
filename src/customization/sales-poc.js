(() => {
  'use strict';

  const FIELD_CODES = {
    nextActionDate: 'next_action_date',
    status: 'ステータス',
    amount: 'amount',
    lostReason: 'lost_reason',
  };

  const ALERT_ID = 'deadline-alert';
  const CLOSED_STATUSES = new Set(['受注', '失注']);

  /**
   * ローカル日付を YYYY-MM-DD 形式で返す。
   * kintoneの日付フィールドと文字列比較できる形式に揃える。
   */
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  /**
   * 次回対応日が期限超過か判定する。
   */
  const isOverdue = (record) => {
    const nextActionDate = record[FIELD_CODES.nextActionDate]?.value;
    const status = record[FIELD_CODES.status]?.value;

    if (!nextActionDate || CLOSED_STATUSES.has(status)) {
      return false;
    }

    return nextActionDate < getToday();
  };

  /**
   * 詳細画面上部に期限超過警告を表示する。
   */
  const renderDeadlineAlert = (record) => {
    const headerSpace = kintone.app.record.getHeaderMenuSpaceElement();

    if (!headerSpace) {
      console.warn(
        '[kintone-sales-poc] ヘッダー表示領域を取得できませんでした。'
      );
      return;
    }

    headerSpace.querySelector(`#${ALERT_ID}`)?.remove();

    if (!isOverdue(record)) {
      return;
    }

    const alertElement = document.createElement('div');
    alertElement.id = ALERT_ID;
    alertElement.setAttribute('role', 'alert');
    alertElement.textContent = '⚠ 次回対応期限を過ぎています';

    Object.assign(alertElement.style, {
      margin: '8px 0',
      padding: '12px 16px',
      border: '1px solid #d93025',
      borderRadius: '4px',
      background: '#fff4f2',
      color: '#b3261e',
      fontWeight: '700',
    });

    headerSpace.appendChild(alertElement);
  };

  /**
   * プロセス遷移前の業務ルールを検証する。
   *
   * - 受注へ進む場合は金額必須
   * - 失注へ進む場合は失注理由必須
   */
  const validateProcessTransition = (event) => {
    const record = event.record;
    const nextStatus = event.nextStatus?.value;

    if (nextStatus === '受注' && !record[FIELD_CODES.amount]?.value) {
      event.error = '受注にするには金額を入力してください。';
      return event;
    }

    if (nextStatus === '失注' && !record[FIELD_CODES.lostReason]?.value) {
      event.error = '失注にするには失注理由を選択してください。';
      return event;
    }

    return event;
  };

  kintone.events.on('app.record.detail.show', (event) => {
    renderDeadlineAlert(event.record);
    return event;
  });

  kintone.events.on(
    'app.record.detail.process.proceed',
    validateProcessTransition
  );
})();
