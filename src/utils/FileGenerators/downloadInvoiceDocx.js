import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType
} from "docx";
import { saveAs } from "file-saver";

/* ==================== I18N ==================== */
const I18N = {
  uz: {
    title: "HISOB-FAKTURA",

    type: {
      outgoing: "Chiqim",
      transfer_out: "Omborlararo chiqim",
      disposal: "Hisobdan chiqarish",
      incoming: "Kirim",
      transfer_in: "Omborlararo kirim",
      return_in: "Qayta qabul",
      return_out: "Qaytarish",
      return_dis: "Qaytarib chiqarish"
    },

    status: {
      draft: "Qoralama",
      sent: "Yuborilgan",
      received: "Qabul qilingan"
    },

    payment: {
      paid: "To‘langan",
      unpaid: "To‘lanmagan",
      partly_paid: "Qisman to‘langan"
    },

    labels: {
      invoiceNumber: "Hujjat raqami",
      type: "Turi",
      sender: "Yuboruvchi",
      receiver: "Qabul qiluvchi",
      status: "Holati",
      payment: "To‘lov holati",
      carrier: "Kuryer",
      date: "Sana",
      product: "Mahsulot",
      qty: "Miqdor",
      price: "Narx",
      discount: "Chegirma",
      total: "Jami",
      note: "Izoh",
      totalSum: "Umumiy summa",
      signature: "Mas’ul shaxs imzosi",
      stamp: "Muhr"
    }
  },

  ru: {
    title: "СЧЁТ-ФАКТУРА",

    type: {
      outgoing: "Расход",
      transfer_out: "Перемещение (расход)",
      disposal: "Списание",
      incoming: "Приход",
      transfer_in: "Перемещение (приход)",
      return_in: "Возврат (приход)",
      return_out: "Возврат (расход)",
      return_dis: "Возвратное списание"
    },

    status: {
      draft: "Черновик",
      sent: "Отправлено",
      received: "Принято"
    },

    payment: {
      paid: "Оплачено",
      unpaid: "Не оплачено",
      partly_paid: "Частично оплачено"
    },

    labels: {
      invoiceNumber: "Номер документа",
      type: "Тип",
      sender: "Отправитель",
      receiver: "Получатель",
      status: "Статус",
      payment: "Статус оплаты",
      carrier: "Курьер",
      date: "Дата",
      product: "Товар",
      qty: "Количество",
      price: "Цена",
      discount: "Скидка",
      total: "Итого",
      note: "Комментарий",
      totalSum: "Общая сумма",
      signature: "Подпись ответственного",
      stamp: "Печать"
    }
  },

  en: {
    title: "INVOICE",

    type: {
      outgoing: "Outgoing",
      transfer_out: "Transfer Out",
      disposal: "Disposal",
      incoming: "Incoming",
      transfer_in: "Transfer In",
      return_in: "Return In",
      return_out: "Return Out",
      return_dis: "Return Disposal"
    },

    status: {
      draft: "Draft",
      sent: "Sent",
      received: "Received"
    },

    payment: {
      paid: "Paid",
      unpaid: "Unpaid",
      partly_paid: "Partly Paid"
    },

    labels: {
      invoiceNumber: "Document Number",
      type: "Type",
      sender: "Sender",
      receiver: "Receiver",
      status: "Status",
      payment: "Payment Status",
      carrier: "Courier",
      date: "Date",
      product: "Product",
      qty: "Quantity",
      price: "Price",
      discount: "Discount",
      total: "Total",
      note: "Note",
      totalSum: "Grand Total",
      signature: "Authorized Signature",
      stamp: "Stamp"
    }
  }
};

/* ==================== MAIN ==================== */
export async function downloadInvoiceDocx(invoice, lang = "uz") {
  const T = I18N[lang] || I18N.uz;
  const L = T.labels;

  const textLine = (label, value) =>
    new Paragraph({
      spacing: { after: 120 },
      children: [
        new TextRun({ text: `${label}: `, bold: true }),
        new TextRun({ text: value ?? "—" })
      ]
    });

  const priceByType = (item) =>
    invoice.type === "outgoing"
      ? Number(item.sale_price)
      : Number(item.purchase_price);

  /* -------------------- HEADER -------------------- */
  const header = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: T.title,
          bold: true,
          size: 36
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: `${L.invoiceNumber}: ${invoice.invoice_number}`,
          size: 20
        })
      ]
    })
  ];

  /* -------------------- META TEXT BLOCK -------------------- */
  const meta = [
    textLine(L.type, T.type[invoice.type]),
    textLine(L.sender, invoice.sender_name),
    textLine(L.receiver, invoice.receiver_name),
    textLine(L.status, T.status[invoice.status]),
    textLine(L.payment, T.payment[invoice.payment_status]),
    textLine(L.carrier, invoice.carrier?.full_name),
    textLine(
      L.date,
      invoice.createdAt
        ? new Date(invoice.createdAt).toLocaleString()
        : "—"
    )
  ];

  /* -------------------- ITEMS TABLE -------------------- */
  const tableHeader = new TableRow({
    children: [
      L.product,
      L.qty,
      L.price,
      L.discount,
      L.total
    ].map(
      (t) =>
        new TableCell({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: t, bold: true })]
            })
          ]
        })
    )
  });

  const rows = invoice.invoice_items.map((it) => {
    const qty = Number(it.quantity);
    const price = priceByType(it);
    const subtotal = qty * price;
    const total =
      it.discount > 0
        ? subtotal - (subtotal * it.discount) / 100
        : subtotal;

    return new TableRow({
      children: [
        it.product?.name,
        `${qty} ${it.product?.unit || ""}`,
        price.toFixed(2),
        it.discount ? `${it.discount}%` : "—",
        total.toFixed(2)
      ].map(
        (v) =>
          new TableCell({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun(String(v))]
              })
            ]
          })
      )
    });
  });

  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    spacing: { before: 400 },
    rows: [tableHeader, ...rows]
  });

  /* -------------------- TOTAL + NOTE -------------------- */
  const totalBlock = new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 300 },
    children: [
      new TextRun({ text: `${L.totalSum}: `, bold: true }),
      new TextRun(String(invoice.total_sum))
    ]
  });

  const note =
    invoice.note &&
    new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: `${L.note}: `, bold: true }),
        new TextRun(invoice.note)
      ]
    });

  /* -------------------- SIGN / STAMP -------------------- */
  const footer = new Paragraph({
    spacing: { before: 600 },
    children: [
      new TextRun({ text: `${L.signature}: ____________________` }),
      new TextRun({ text: `\n${L.stamp}: ____________________` })
    ]
  });

  /* -------------------- DOC -------------------- */
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...header,
          ...meta,
          itemsTable,
          totalBlock,
          ...(note ? [note] : []),
          footer
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${invoice.invoice_number}.docx`);
}
