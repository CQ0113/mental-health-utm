import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.PSYCARE_BASE_URL ?? 'http://localhost:8001';
const outputDir = path.resolve('docs/real-ui-captures');

const termsRecord = {
  'CLT-002': {
    clientId: 'CLT-002',
    clientName: 'NUR AINA HAMZAH',
    accepted: true,
    acceptedAt: '2026-06-06T14:00:00.000Z',
    version: '2026-05-29',
  },
};

const acceptedInitScript = () => {
  localStorage.setItem('psycare-language', 'en');
  localStorage.setItem(
    'psycare.client.terms-acceptance',
    JSON.stringify({
      'CLT-002': {
        clientId: 'CLT-002',
        clientName: 'NUR AINA HAMZAH',
        accepted: true,
        acceptedAt: '2026-06-06T14:00:00.000Z',
        version: '2026-05-29',
      },
    }),
  );
};

const languageOnlyInitScript = () => {
  localStorage.setItem('psycare-language', 'en');
  localStorage.removeItem('psycare.client.terms-acceptance');
};

const captures = [
  {
    id: '01-client-terms-acceptance',
    title: 'Client Portal - Terms Acceptance Modal',
    route: '/psycare/dashboard',
    coverage: 'Initial client access and terms acceptance before using PsyCare.',
  },
  {
    id: '02-client-dashboard-emotion',
    title: 'Client Portal - Dashboard Emotion Tracker',
    route: '/psycare/dashboard',
    coverage: 'CT01 Log Daily Emotion, CT03 View Emotion History, dashboard entry point.',
  },
  {
    id: '03-client-ai-chatbot-risk',
    title: 'Client Portal - AI Chatbot Open With Risk Detection',
    route: '/psycare/dashboard',
    coverage: 'CT02 Chat with AI Counsellor and automatic risk flag trigger.',
    action: async (page) => {
      await clickFirst(page.getByLabel('Open AI chatbot'));
      await page.getByPlaceholder('Type your message...').fill('I feel panic and stressed about assignments.');
      await clickFirst(page.getByRole('button', { name: 'Send' }));
    },
  },
  {
    id: '04-client-services-declaration',
    title: 'Client Portal - Services, Profile And Declaration',
    route: '/psycare/perkhidmatan',
    coverage: 'UM03 Manage User Profiles, DC01 View Declaration Form, DC02 Submit Declaration.',
  },
  {
    id: '05-client-appointment-entry',
    title: 'Client Portal - Appointment Request Entry',
    route: '/psycare/permohonan',
    coverage: 'AS01 Book Appointment entry choice between new booking and follow-up.',
  },
  {
    id: '06-client-new-appointment-form',
    title: 'Client Portal - Smart Appointment Form',
    route: '/psycare/permohonan',
    coverage: 'AS01 Book Appointment and AS03 Book New Appointment form fields, slot selection, declaration notice.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'Create New Booking' }));
    },
  },
  {
    id: '07-client-appointment-records',
    title: 'Client Portal - Appointment Records',
    route: '/psycare/rekod-temujanji',
    coverage: 'AS02 Request Follow-Up appointment records and TA01 join-session entry point.',
  },
  {
    id: '08-client-follow-up-form',
    title: 'Client Portal - Follow-Up Appointment Form',
    route: '/psycare/rekod-temujanji',
    coverage: 'AS02 Request Follow-Up and linked AS03 follow-up booking form.',
    action: async (page) => {
      await Promise.all([
        page.waitForURL('**/psycare/permohonan?mode=followup**', { timeout: 15000 }),
        clickFirst(page.getByRole('button', { name: 'Follow Up' })),
      ]);
      await page.getByText('Follow-up mode selected').waitFor({ timeout: 15000 });
    },
  },
  {
    id: '09-client-psychometric-test',
    title: 'Client Portal - Psychometric Self-Assessment',
    route: '/psycare/ujian-psikometrik',
    coverage: 'SA01 Take Psychometric Test with available tests, questions, answers, draft and submit controls.',
  },
  {
    id: '10-client-resource-library',
    title: 'Client Portal - Resource Library',
    route: '/psycare/resource-library',
    coverage: 'ER02 Access Learning Materials, search, filter, and open resource behavior.',
  },
  {
    id: '11-client-support-forum',
    title: 'Client Portal - Peer Support Forum',
    route: '/psycare/forum-sokongan',
    coverage: 'PS01 Submit Forum Post, category selection, safety review, and post queue feedback.',
  },
  {
    id: '12-admin-dashboard',
    title: 'Admin Portal - Dashboard',
    route: '/admin/dashboard',
    coverage: 'Admin entry point for appointment queue, resources, psychometric tests, and moderation work.',
  },
  {
    id: '13-admin-service-management',
    title: 'Admin Portal - Service Management',
    route: '/admin/service',
    coverage: 'Appointment service and counselling service setup used by scheduling flows.',
  },
  {
    id: '14-admin-counsellor-ppsi',
    title: 'Admin Portal - Counsellor PPsi Management',
    route: '/admin/counsellor-ppsi',
    coverage: 'UM01 Onboard Counsellor and counsellor profile maintenance.',
  },
  {
    id: '15-admin-counsellor-timetable',
    title: 'Admin Portal - Counsellor Timetable',
    route: '/admin/counsellor-timetable',
    coverage: 'Counsellor timetable planning related to appointment slot setup.',
  },
  {
    id: '16-admin-client-information',
    title: 'Admin Portal - Client Information',
    route: '/admin/client-information',
    coverage: 'UM02 Find Client Profile and UM03 Manage User Profiles.',
  },
  {
    id: '17-admin-appointment-queue',
    title: 'Admin Portal - Appointment Queue',
    route: '/admin/appointments',
    coverage: 'AS07 Verify Appointment, admin/counsellor review queue, and attendance access.',
  },
  {
    id: '18-admin-appointment-review-modal',
    title: 'Admin Portal - Appointment Review Modal',
    route: '/admin/appointments',
    coverage: 'AS07 Verify Appointment review details, submitted client form snapshot, and approval controls.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'View' }));
    },
  },
  {
    id: '19-admin-appointment-attendance-modal',
    title: 'Admin Portal - Attendance Record Modal',
    route: '/admin/appointments',
    coverage: 'TA02 Record Attendance, TA03 Scan Physical QR Code, TA04 Auto-log Attendance overview.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'Attendance' }));
    },
  },
  {
    id: '20-slot-manager',
    title: 'Admin/Counsellor Portal - Appointment Slot Manager',
    route: '/counsellor/slots',
    coverage: 'AS04 Manage Slots, AS05 Bulk Generate Slots, AS06 Import CSV Timetable.',
  },
  {
    id: '21-slot-bulk-summary',
    title: 'Admin/Counsellor Portal - Slot Bulk Generation Summary',
    route: '/counsellor/slots',
    coverage: 'AS05 Bulk Generate Slots and draft slot change summary.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'Generate Bulk Slots' }));
    },
  },
  {
    id: '22-admin-psychometric-materials',
    title: 'Admin Portal - Psychometric Materials',
    route: '/admin/materials',
    coverage: 'SA03 Manage Test, upload PDF, generate tests, and review current tests.',
  },
  {
    id: '23-admin-learning-materials',
    title: 'Admin Portal - Learning Materials',
    route: '/admin/learning-materials',
    coverage: 'ER01 Manage Resource Library and upload learning materials.',
  },
  {
    id: '24-admin-forum-moderation',
    title: 'Admin Portal - Forum Moderation',
    route: '/admin/forum',
    coverage: 'PS02 Moderate Forum, filter posts, confirm actions, and moderation log.',
  },
  {
    id: '25-counsellor-dashboard',
    title: 'Counsellor Portal - Dashboard',
    route: '/counsellor/dashboard',
    coverage: 'Counsellor entry point for appointments, caseload, tasks, and psychometric results.',
  },
  {
    id: '26-counsellor-appointments',
    title: 'Counsellor Portal - Appointment Records',
    route: '/counsellor/appointments',
    coverage: 'AS07 counsellor review, TA02 attendance access, and follow-up controls.',
  },
  {
    id: '27-counsellor-appointment-review-modal',
    title: 'Counsellor Portal - Appointment Detail Modal',
    route: '/counsellor/appointments',
    coverage: 'AS07 counsellor approval details and submitted form review.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'View' }));
    },
  },
  {
    id: '28-counsellor-attendance-modal',
    title: 'Counsellor Portal - Attendance Record Modal',
    route: '/counsellor/appointments',
    coverage: 'TA02 Record Attendance, TA03 QR attendance, and attendance participant editing.',
    action: async (page) => {
      await clickFirst(page.getByRole('button', { name: 'Attendance' }));
    },
  },
  {
    id: '29-counsellor-caseload',
    title: 'Counsellor Portal - Flagged Client Caseload',
    route: '/counsellor/caseload',
    coverage: 'CT04 Investigate Flagged Client and CT03 emotion history from counsellor caseload.',
  },
  {
    id: '30-counsellor-tasks',
    title: 'Counsellor Portal - Intervention Tasks',
    route: '/counsellor/tasks',
    coverage: 'CT04 create intervention task and track counsellor follow-up work.',
  },
  {
    id: '31-counsellor-psychometric-results',
    title: 'Counsellor Portal - Psychometric Results Triage',
    route: '/counsellor/assessments',
    coverage: 'SA02 View Triage Dashboard and submission review.',
  },
];

async function clickFirst(locator) {
  const count = await locator.count();
  if (count === 0) {
    throw new Error('Expected clickable element was not found.');
  }
  await locator.first().click();
}

async function gotoAndSettle(page, route) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(900);
}

async function screenshotCapture(page, capture) {
  const fileName = `${capture.id}.png`;
  const filePath = path.join(outputDir, fileName);

  await gotoAndSettle(page, capture.route);

  if (capture.action) {
    await capture.action(page);
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(900);
  }

  await page.screenshot({ path: filePath, fullPage: false });

  return {
    ...capture,
    file: fileName,
    path: filePath,
    url: page.url(),
  };
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const viewport = { width: 1440, height: 1000 };
  const manifest = [];

  const termsContext = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await termsContext.addInitScript(languageOnlyInitScript);
  const termsPage = await termsContext.newPage();
  manifest.push(await screenshotCapture(termsPage, captures[0]));
  await termsContext.close();

  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await context.addInitScript(acceptedInitScript);
  const page = await context.newPage();

  await page.goto(`${baseUrl}/psycare/dashboard`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate((record) => {
    localStorage.setItem('psycare-language', 'en');
    localStorage.setItem('psycare.client.terms-acceptance', JSON.stringify(record));
  }, termsRecord);

  for (const capture of captures.slice(1)) {
    try {
      manifest.push(await screenshotCapture(page, capture));
      console.log(`captured ${capture.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`failed ${capture.id}: ${message}`);
      manifest.push({
        ...capture,
        file: null,
        path: null,
        url: `${baseUrl}${capture.route}`,
        error: message,
      });
    }
  }

  await fs.writeFile(
    path.join(outputDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  );

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
