(() => {
  'use strict';

  const FIELD_CODES = {
    nextActionDate: 'next_action_date',
    status: 'ステータス',
  };

  const SPACE_ID = 'alert_space';
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
   * 期限超過警告を表示する。
   */
  const renderDeadlineAlert = (record) => {
    const spaceElement = kintone.app.record.getSpaceElement(SPACE_ID);

    if (!spaceElement) {
      console.warn(
        `[kintone-sales-poc] スペースフィールド "${SPACE_ID}" が見つかりません。`
      );
      return;
    }

    // 詳細画面の再描画時に重複表示しないよう初期化する。
    spaceElement.replaceChildren();

    if (!isOverdue(record)) {
      return;
    }

    const alertElement = document.createElement('div');
    alertElement.setAttribute('role', 'alert');
    alertElement.textContent = '⚠ 次回対応期限を過ぎています';

    Object.assign(alertElement.style, {
      padding: '12px 16px',
      border: '1px solid #d93025',
      borderRadius: '4px',
      background: '#fff4f2',
      color: '#b3261e',
      fontWeight: '700',
    });

    spaceElement.appendChild(alertElement);
  };

  kintone.events.on('app.record.detail.show', (event) => {
    renderDeadlineAlert(event.record);
    return event;
  });
})();
