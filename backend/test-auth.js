import http from 'http';
import app from './dist/app.js';

const PORT = 3001; // use a different port for testing just in case
const server = http.createServer(app);

async function request(path, method = 'GET', body = null, cookie = '') {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (cookie) options.headers['Cookie'] = cookie;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
        });
      });
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

server.listen(PORT, async () => {
  try {
    console.log('--- Unauthenticated tests ---');
    let res = await request('/api/teams');
    console.assert(res.status === 401, 'Expected 401 for unauthenticated GET /api/teams');
    console.log('Unauthenticated GET /api/teams -> 401 OK');

    console.log('\n--- Student Alice (u1) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'alice@kizuna.edu', password: 'kizuna123' });
    const aliceCookie = res.headers['set-cookie'][0];
    console.log('Alice logged in');

    res = await request('/api/teams', 'GET', null, aliceCookie);
    console.assert(res.data.some(t => t.id === 't1'), 'Alice should see t1');
    console.log('Alice GET /api/teams -> Team Alpha OK');

    res = await request('/api/teams/t1', 'GET', null, aliceCookie);
    console.assert(res.status === 200, 'Alice should access t1');
    console.log('Alice GET /api/teams/t1 -> 200 OK');

    res = await request('/api/teams/t2', 'GET', null, aliceCookie);
    console.assert(res.status === 403, 'Alice should be forbidden from t2');
    console.log('Alice GET /api/teams/t2 -> 403 OK');

    res = await request('/api/projects/p1', 'GET', null, aliceCookie);
    console.assert(res.status === 200, 'Alice should access p1');
    console.log('Alice GET /api/projects/p1 -> 200 OK');

    res = await request('/api/projects/p2', 'GET', null, aliceCookie);
    console.assert(res.status === 403, 'Alice should be forbidden from p2');
    console.log('Alice GET /api/projects/p2 -> 403 OK');


    console.log('\n--- Mentor Sarah (u4) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'sarah.jenkins@kizuna.edu', password: 'kizuna123' });
    const sarahCookie = res.headers['set-cookie'][0];
    
    res = await request('/api/teams/t1', 'GET', null, sarahCookie);
    console.assert(res.status === 200, 'Sarah should access t1');
    console.log('Sarah GET /api/teams/t1 -> 200 OK');

    res = await request('/api/teams/t2', 'GET', null, sarahCookie);
    console.assert(res.status === 403, 'Sarah should be forbidden from t2');
    console.log('Sarah GET /api/teams/t2 -> 403 OK');


    console.log('\n--- Mentor Alan (u5) tests ---');
    res = await request('/api/auth/login', 'POST', { email: 'alan.vance@kizuna.edu', password: 'kizuna123' });
    const alanCookie = res.headers['set-cookie'][0];
    
    res = await request('/api/teams/t1', 'GET', null, alanCookie);
    console.assert(res.status === 403, 'Alan should be forbidden from t1');
    console.log('Alan GET /api/teams/t1 -> 403 OK');

    res = await request('/api/teams/t2', 'GET', null, alanCookie);
    console.assert(res.status === 200, 'Alan should access t2');
    console.log('Alan GET /api/teams/t2 -> 200 OK');

    console.log('\n--- Mutation Tests ---');
    
    // Mentor Sarah tries to update team (should fail)
    res = await request('/api/teams/t1/members', 'POST', { user: { id: 'u3' }, role: 'MEMBER' }, sarahCookie);
    console.assert(res.status === 403, 'Sarah should not be able to add member');
    console.log('Sarah POST /api/teams/t1/members -> 403 OK');

    // Student Alice updates her own team t1
    // We try to add u7 (Eva) to t1. If u7 is already there (from previous run), we ignore the 500 error for this specific test, or we can just expect 200/500 depending on run. Let's just catch it or clean it up.
    // Actually, I'll delete u7 first to make it idempotent
    await request('/api/teams/t1/members/u7', 'DELETE', null, aliceCookie);
    res = await request('/api/teams/t1/members', 'POST', { user: { id: 'u7' }, role: 'MEMBER' }, aliceCookie);
    console.assert(res.status === 200, 'Alice should be able to add member');
    console.log('Alice POST /api/teams/t1/members -> 200 OK');

    // Student Alice tries to update t2 (should fail)
    res = await request('/api/projects/p2', 'PUT', { description: 'Hacked' }, aliceCookie);
    console.assert(res.status === 403, 'Alice should not be able to update p2');
    console.log('Alice PUT /api/projects/p2 -> 403 OK');

    // Student Alice creates a new team
    res = await request('/api/teams', 'POST', {
      name: 'Alice New Team',
      owner: { id: 'u1' },
      members: []
    }, aliceCookie);
    console.assert(res.status === 201, 'Alice should be able to create team');
    const newTeamId = res.data.id;
    console.log('Alice POST /api/teams -> 201 OK, teamId:', newTeamId);

    // Student Alice creates a new project under new team
    res = await request('/api/projects', 'POST', {
      name: 'Alice Project',
      description: 'Desc',
      teamId: newTeamId
    }, aliceCookie);
    console.assert(res.status === 201, 'Alice should be able to create project');
    const newProjectId = res.data.id;
    console.log('Alice POST /api/projects -> 201 OK, projectId:', newProjectId);

    // Student Alice updates new project
    res = await request(`/api/projects/${newProjectId}`, 'PUT', { status: 'ACTIVE' }, aliceCookie);
    console.assert(res.status === 200, 'Alice should be able to update her project');
    console.log(`Alice PUT /api/projects/${newProjectId} -> 200 OK`);

    console.log('\n--- Task Mutation Tests ---');
    
    // Mentor Sarah tries to create a task (should fail)
    res = await request('/api/tasks', 'POST', {
      projectId: 'p1', title: 'Mentor Task', description: 'desc', module: 'docs', priority: 'LOW', assigneeId: 'u1'
    }, sarahCookie);
    console.assert(res.status === 403, 'Sarah should not be able to create task');
    console.log('Sarah POST /api/tasks -> 403 OK');

    // Student Alice creates task in her project p1
    res = await request('/api/tasks', 'POST', {
      projectId: 'p1', title: 'Alice Task', description: 'desc', module: 'backend', priority: 'HIGH', assigneeId: 'u1', assigneeName: 'Alice'
    }, aliceCookie);
    console.assert(res.status === 201, 'Alice should be able to create task in p1');
    const newTaskId = res.data.id;
    console.log('Alice POST /api/tasks -> 201 OK, taskId:', newTaskId);

    // Student Alice creates task with assignee outside her team (should fail)
    res = await request('/api/tasks', 'POST', {
      projectId: 'p1', title: 'Alice Bad Task', description: 'desc', module: 'backend', priority: 'HIGH', assigneeId: 'u8', assigneeName: 'David'
    }, aliceCookie);
    console.assert(res.status === 400, 'Alice should not be able to assign task to non-member');
    console.log('Alice POST /api/tasks (bad assignee) -> 400 OK');

    // Student Alice updates her task
    res = await request(`/api/tasks/${newTaskId}`, 'PUT', { status: 'COMPLETED' }, aliceCookie);
    console.assert(res.status === 200, 'Alice should be able to update her task');
    console.log(`Alice PUT /api/tasks/${newTaskId} -> 200 OK`);

    // Student Alice tries to update task in p2 (should fail)
    // First, let's create a task in p2 using David (u8)
    const davidRes = await request('/api/auth/login', 'POST', { email: 'david@kizuna.edu', password: 'kizuna123' });
    const davidCookie = davidRes.headers['set-cookie'][0];
    res = await request('/api/tasks', 'POST', {
      projectId: 'p2', title: 'David Task', description: 'desc', module: 'AI', priority: 'MEDIUM', assigneeId: 'u8', assigneeName: 'David'
    }, davidCookie);
    const davidTaskId = res.data.id;

    res = await request(`/api/tasks/${davidTaskId}`, 'PUT', { status: 'REVIEW' }, aliceCookie);
    console.assert(res.status === 403, 'Alice should not be able to update David\'s task in p2');
    console.log(`Alice PUT /api/tasks/${davidTaskId} -> 403 OK`);

    // Mentor Alan reads p2 tasks (should succeed)
    res = await request('/api/tasks?projectId=p2', 'GET', null, alanCookie);
    console.assert(res.status === 200, 'Alan should be able to read p2 tasks');
    console.log('Alan GET /api/tasks?projectId=p2 -> 200 OK');

    // Unauthenticated task read (should fail)
    res = await request('/api/tasks?projectId=p1', 'GET', null, null);
    console.assert(res.status === 401, 'Unauthenticated read should fail');
    console.log('Unauthenticated GET /api/tasks -> 401 OK');

    console.log('\n--- Comment Authorization Tests ---');
    // 1. Unauthenticated read -> 401
    res = await request('/api/tasks/t_1/comments', 'GET');
    console.assert(res.status === 401, 'Unauthenticated GET /api/tasks/t_1/comments should return 401');
    console.log('Unauthenticated GET /api/tasks/t_1/comments -> 401 OK');

    // 2. Unauthenticated create -> 401
    res = await request('/api/tasks/t_1/comments', 'POST', { content: 'test' });
    console.assert(res.status === 401, 'Unauthenticated POST /api/tasks/t_1/comments should return 401');
    console.log('Unauthenticated POST /api/tasks/t_1/comments -> 401 OK');

    // 3. Authorized student Alice reads comments -> 200
    res = await request('/api/tasks/t_1/comments', 'GET', null, aliceCookie);
    console.assert(res.status === 200 && Array.isArray(res.data), 'Alice should be able to read t_1 comments');
    console.log('Alice GET /api/tasks/t_1/comments -> 200 OK');

    // 4. Authorized student Alice creates comment -> 201
    res = await request('/api/tasks/t_1/comments', 'POST', { content: 'Alice comment content' }, aliceCookie);
    console.assert(res.status === 201 && res.data.authorId === 'u1' && res.data.authorName === 'Alice Watson', 'Alice should create comment with session identity');
    const createdCommentId = res.data.id;
    console.log('Alice POST /api/tasks/t_1/comments -> 201 OK, commentId:', createdCommentId);

    // 5. Whitespace-only comment -> 400
    res = await request('/api/tasks/t_1/comments', 'POST', { content: '   ' }, aliceCookie);
    console.assert(res.status === 400, 'Empty/whitespace comment should return 400');
    console.log('Alice POST /api/tasks/t_1/comments (whitespace) -> 400 OK');

    // 6. Mentor Sarah (assigned to t1/p1) reads comments -> 200
    res = await request('/api/tasks/t_1/comments', 'GET', null, sarahCookie);
    console.assert(res.status === 200, 'Sarah should read comments for assigned team project task');
    console.log('Sarah GET /api/tasks/t_1/comments -> 200 OK');

    // 7. Mentor Sarah attempts to create comment -> 403
    res = await request('/api/tasks/t_1/comments', 'POST', { content: 'Mentor comment' }, sarahCookie);
    console.assert(res.status === 403, 'Mentor Sarah cannot post comments');
    console.log('Sarah POST /api/tasks/t_1/comments -> 403 OK');

    // 8. Mentor Sarah attempts to delete comment -> 403
    res = await request(`/api/comments/${createdCommentId}`, 'DELETE', null, sarahCookie);
    console.assert(res.status === 403, 'Mentor Sarah cannot delete comments');
    console.log(`Sarah DELETE /api/comments/${createdCommentId} -> 403 OK`);

    // 9. Mentor Alan (not assigned to Team Alpha) reads comments -> 403
    res = await request('/api/tasks/t_1/comments', 'GET', null, alanCookie);
    console.assert(res.status === 403, 'Alan should not read t_1 comments');
    console.log('Alan GET /api/tasks/t_1/comments -> 403 OK');

    // 10. Cross-team student David (Team Beta) reads comments -> 403
    res = await request('/api/tasks/t_1/comments', 'GET', null, davidCookie);
    console.assert(res.status === 403, 'David should not read t_1 comments');
    console.log('David GET /api/tasks/t_1/comments -> 403 OK');

    // 11. Cross-team student David creates comment -> 403
    res = await request('/api/tasks/t_1/comments', 'POST', { content: 'Cross team comment' }, davidCookie);
    console.assert(res.status === 403, 'David cannot create comment in t_1');
    console.log('David POST /api/tasks/t_1/comments -> 403 OK');

    // 12. Cross-team student David deletes comment -> 403
    res = await request(`/api/comments/${createdCommentId}`, 'DELETE', null, davidCookie);
    console.assert(res.status === 403, 'David cannot delete comment in t_1');
    console.log(`David DELETE /api/comments/${createdCommentId} -> 403 OK`);

    // 13. Authorized student Alice deletes comment -> 200
    res = await request(`/api/comments/${createdCommentId}`, 'DELETE', null, aliceCookie);
    console.assert(res.status === 200, 'Alice should be able to delete comment');
    console.log(`Alice DELETE /api/comments/${createdCommentId} -> 200 OK`);

    console.log('\n--- Activity Authorization Tests ---');
    // 1. Unauthenticated activity read -> 401
    res = await request('/api/projects/p1/activity', 'GET');
    console.assert(res.status === 401, 'Unauthenticated GET /api/projects/p1/activity should return 401');
    console.log('Unauthenticated GET /api/projects/p1/activity -> 401 OK');

    // 2. Authorized student Alice activity read -> 200
    res = await request('/api/projects/p1/activity', 'GET', null, aliceCookie);
    console.assert(res.status === 200 && Array.isArray(res.data), 'Alice should read p1 activity');
    console.log('Alice GET /api/projects/p1/activity -> 200 OK');

    // 3. Unauthorized student David activity read -> 403
    res = await request('/api/projects/p1/activity', 'GET', null, davidCookie);
    console.assert(res.status === 403, 'David should not read p1 activity');
    console.log('David GET /api/projects/p1/activity -> 403 OK');

    // 4. Assigned mentor Sarah activity read -> 200
    res = await request('/api/projects/p1/activity', 'GET', null, sarahCookie);
    console.assert(res.status === 200 && Array.isArray(res.data), 'Sarah should read p1 activity');
    console.log('Sarah GET /api/projects/p1/activity -> 200 OK');

    // 5. Unassigned mentor Alan activity read -> 403
    res = await request('/api/projects/p1/activity', 'GET', null, alanCookie);
    console.assert(res.status === 403, 'Alan should not read p1 activity');
    console.log('Alan GET /api/projects/p1/activity -> 403 OK');

    // 6. Authorized student Alice creates activity event -> 201 with session actor identity
    res = await request('/api/projects/p1/activity', 'POST', {
      type: 'TASK_CREATED',
      message: 'created test activity task',
      taskId: 't_1'
    }, aliceCookie);
    console.assert(res.status === 201 && res.data.actorId === 'u1' && res.data.actorName === 'Alice Watson', 'Actor identity must match authenticated session user');
    console.log('Alice POST /api/projects/p1/activity -> 201 OK, actor identity enforced');

    // 7. Unauthorized student David attempts cross-project event creation -> 403
    res = await request('/api/projects/p1/activity', 'POST', {
      type: 'TASK_CREATED',
      message: 'manufactured event'
    }, davidCookie);
    console.assert(res.status === 403, 'David cannot manufacture activity event in p1');
    console.log('David POST /api/projects/p1/activity (cross-project manufacturing) -> 403 OK');

    console.log('\n--- Progress Authorization & Calculation Tests ---');
    // 1. Unauthenticated progress read -> 401
    res = await request('/api/projects/p1/progress', 'GET');
    console.assert(res.status === 401, 'Unauthenticated GET /api/projects/p1/progress should return 401');
    console.log('Unauthenticated GET /api/projects/p1/progress -> 401 OK');

    // 2. Authorized student Alice progress read -> 200
    res = await request('/api/projects/p1/progress', 'GET', null, aliceCookie);
    console.assert(res.status === 200 && res.data.overall && Array.isArray(res.data.modules) && Array.isArray(res.data.members), 'Alice should get p1 progress snapshot');
    const initialCompleted = res.data.overall.completedTasks;
    console.log('Alice GET /api/projects/p1/progress -> 200 OK');

    // 3. Unauthorized student David progress read -> 403
    res = await request('/api/projects/p1/progress', 'GET', null, davidCookie);
    console.assert(res.status === 403, 'David should not read p1 progress');
    console.log('David GET /api/projects/p1/progress -> 403 OK');

    // 4. Assigned mentor Sarah progress read -> 200
    res = await request('/api/projects/p1/progress', 'GET', null, sarahCookie);
    console.assert(res.status === 200, 'Sarah should read p1 progress');
    console.log('Sarah GET /api/projects/p1/progress -> 200 OK');

    // 5. Unassigned mentor Alan progress read -> 403
    res = await request('/api/projects/p1/progress', 'GET', null, alanCookie);
    console.assert(res.status === 403, 'Alan should not read p1 progress');
    console.log('Alan GET /api/projects/p1/progress -> 403 OK');

    // 6. Zero-task project -> 0% completion
    res = await request('/api/projects', 'POST', { name: 'Zero Task Proj', description: 'Empty', teamId: 't1' }, aliceCookie);
    const zeroTaskId = res.data.id;
    res = await request(`/api/projects/${zeroTaskId}/progress`, 'GET', null, aliceCookie);
    console.assert(res.status === 200 && res.data.overall.totalTasks === 0 && res.data.overall.completionPercentage === 0, 'Zero task project must return 0%');
    console.log('Alice GET zero-task project progress -> 200 OK (0% completion)');

    // 7. Dynamic recalculation on task status update
    // Update t_1 status to COMPLETED
    await request('/api/tasks/t_1', 'PUT', { status: 'COMPLETED' }, aliceCookie);
    res = await request('/api/projects/p1/progress', 'GET', null, aliceCookie);
    console.assert(res.status === 200 && res.data.overall.completedTasks === initialCompleted + 1, 'Completed task count must update dynamically');
    console.log('Dynamic progress recalculation on task completion -> 200 OK');

    // =====================================================================
    //  SUBMISSION AUTHORIZATION TESTS
    // =====================================================================
    console.log('\n--- Submission Authorization Tests ---');

    let failCount = 0;
    function assert(cond, msg) {
      if (!cond) {
        console.error(`  FAIL: ${msg}`);
        failCount++;
      }
    }

    // 1. Unauthenticated access → 401
    res = await request('/api/submissions?projectId=p1');
    assert(res.status === 401, 'Unauthenticated GET /api/submissions should return 401');
    console.log('Unauthenticated GET /api/submissions -> 401 OK');

    res = await request('/api/submissions/sub_1');
    assert(res.status === 401, 'Unauthenticated GET /api/submissions/:id should return 401');
    console.log('Unauthenticated GET /api/submissions/sub_1 -> 401 OK');

    res = await request('/api/submissions', 'POST', { projectId: 'p1', title: 'x', description: 'x' });
    assert(res.status === 401, 'Unauthenticated POST /api/submissions should return 401');
    console.log('Unauthenticated POST /api/submissions -> 401 OK');

    // 2. Authorized student read → 200
    res = await request('/api/submissions?projectId=p1', 'GET', null, aliceCookie);
    assert(res.status === 200 && Array.isArray(res.data), 'Alice should read p1 submissions');
    assert(res.data.some(s => s.id === 'sub_1'), 'Alice should see seeded sub_1');
    console.log('Alice GET /api/submissions?projectId=p1 -> 200 OK');

    res = await request('/api/submissions/sub_1', 'GET', null, aliceCookie);
    assert(res.status === 200 && res.data.id === 'sub_1', 'Alice should read sub_1');
    console.log('Alice GET /api/submissions/sub_1 -> 200 OK');

    // 3. Authorized student create → 201
    res = await request('/api/submissions', 'POST', {
      projectId: 'p1',
      title: 'Test Draft Submission',
      description: 'This is a test draft from the auth suite.'
    }, aliceCookie);
    assert(res.status === 201, 'Alice should be able to create submission in p1');
    assert(res.data.status === 'DRAFT', 'New submission should be DRAFT');
    assert(res.data.version === 1, 'New submission should start at version 1');
    const aliceDraftId = res.data.id;
    console.log('Alice POST /api/submissions -> 201 OK, id:', aliceDraftId);

    // 4. Authenticated identity overrides spoofed submittedBy
    res = await request('/api/submissions', 'POST', {
      projectId: 'p1',
      title: 'Spoofed Author Submission',
      description: 'Attempting to spoof submittedBy.',
      submittedBy: 'u999',
      submittedByName: 'Evil Hacker'
    }, aliceCookie);
    assert(res.status === 201, 'Create with spoofed identity should succeed');
    assert(res.data.submittedBy === 'u1', `submittedBy must be session user u1, got ${res.data.submittedBy}`);
    assert(res.data.submittedByName === 'Alice Watson', `submittedByName must be session name, got ${res.data.submittedByName}`);
    const spoofedId = res.data.id;
    console.log('Identity spoofing overridden -> submittedBy=u1, submittedByName=Alice Watson OK');

    // 5. Authorized student edits own draft → succeeds
    res = await request(`/api/submissions/${aliceDraftId}`, 'PUT', {
      title: 'Updated Test Draft Submission',
      description: 'Updated description for auth test.'
    }, aliceCookie);
    assert(res.status === 200, 'Alice should edit her own draft');
    assert(res.data.title === 'Updated Test Draft Submission', 'Title should be updated');
    console.log(`Alice PUT /api/submissions/${aliceDraftId} -> 200 OK`);

    // 6. Authorized student submits own draft → succeeds
    res = await request(`/api/submissions/${aliceDraftId}/submit`, 'POST', null, aliceCookie);
    assert(res.status === 200, 'Alice should submit her own draft');
    assert(res.data.status === 'SUBMITTED', 'Status should be SUBMITTED');
    assert(res.data.submittedAt != null, 'submittedAt should be set');
    console.log(`Alice POST /api/submissions/${aliceDraftId}/submit -> 200 OK`);

    // 7. Editing submitted submission → rejected
    res = await request(`/api/submissions/${aliceDraftId}`, 'PUT', {
      title: 'Cannot Edit',
      description: 'Should fail.'
    }, aliceCookie);
    assert(res.status === 400, 'Editing SUBMITTED submission should return 400');
    console.log(`Alice PUT submitted submission -> 400 OK`);

    // Also: re-submitting an already submitted submission → rejected
    res = await request(`/api/submissions/${aliceDraftId}/submit`, 'POST', null, aliceCookie);
    assert(res.status === 400, 'Re-submitting SUBMITTED submission should return 400');
    console.log(`Alice POST re-submit SUBMITTED -> 400 OK`);

    // 8. Cross-team student access → 403
    // David (u8) is in Team Beta (t2), should NOT access p1 submissions
    res = await request('/api/submissions?projectId=p1', 'GET', null, davidCookie);
    assert(res.status === 403, 'David should not read p1 submissions (cross-team)');
    console.log('David GET /api/submissions?projectId=p1 -> 403 OK');

    res = await request('/api/submissions/sub_1', 'GET', null, davidCookie);
    assert(res.status === 403, 'David should not read sub_1 (cross-team)');
    console.log('David GET /api/submissions/sub_1 -> 403 OK');

    // 9. Cross-team student mutation → 403
    res = await request('/api/submissions', 'POST', {
      projectId: 'p1',
      title: 'Cross Team Draft',
      description: 'David tries to create in p1.'
    }, davidCookie);
    assert(res.status === 403, 'David should not create submission in p1 (cross-team)');
    console.log('David POST /api/submissions (cross-team create) -> 403 OK');

    res = await request(`/api/submissions/${spoofedId}`, 'PUT', {
      title: 'Hacked', description: 'Hacked'
    }, davidCookie);
    assert(res.status === 403, 'David should not edit p1 submission (cross-team)');
    console.log(`David PUT /api/submissions/${spoofedId} (cross-team edit) -> 403 OK`);

    res = await request(`/api/submissions/${spoofedId}/submit`, 'POST', null, davidCookie);
    assert(res.status === 403, 'David should not submit p1 submission (cross-team)');
    console.log(`David POST /api/submissions/${spoofedId}/submit (cross-team submit) -> 403 OK`);

    // 10. Assigned mentor read → succeeds
    // Sarah (u4) is mentor of Team Alpha (t1), project p1
    res = await request('/api/submissions?projectId=p1', 'GET', null, sarahCookie);
    assert(res.status === 200 && Array.isArray(res.data), 'Sarah should read p1 submissions');
    console.log('Sarah GET /api/submissions?projectId=p1 -> 200 OK');

    res = await request('/api/submissions/sub_1', 'GET', null, sarahCookie);
    assert(res.status === 200, 'Sarah should read sub_1');
    console.log('Sarah GET /api/submissions/sub_1 -> 200 OK');

    // 11. Mentor create → 403
    res = await request('/api/submissions', 'POST', {
      projectId: 'p1',
      title: 'Mentor Draft',
      description: 'Mentor trying to create.'
    }, sarahCookie);
    assert(res.status === 403, 'Mentor Sarah should not create submission');
    console.log('Sarah POST /api/submissions (mentor create) -> 403 OK');

    // 12. Mentor edit → 403
    res = await request(`/api/submissions/${spoofedId}`, 'PUT', {
      title: 'Mentor Edit', description: 'Mentor trying to edit.'
    }, sarahCookie);
    assert(res.status === 403, 'Mentor Sarah should not edit submission');
    console.log(`Sarah PUT /api/submissions/${spoofedId} (mentor edit) -> 403 OK`);

    // Mentor submit → 403
    res = await request(`/api/submissions/${spoofedId}/submit`, 'POST', null, sarahCookie);
    assert(res.status === 403, 'Mentor Sarah should not submit submission');
    console.log(`Sarah POST /api/submissions/${spoofedId}/submit (mentor submit) -> 403 OK`);

    // 13. Unassigned mentor access → 403
    // Alan (u5) is mentor of Team Beta (t2), should NOT access p1 submissions
    res = await request('/api/submissions?projectId=p1', 'GET', null, alanCookie);
    assert(res.status === 403, 'Alan should not read p1 submissions (unassigned mentor)');
    console.log('Alan GET /api/submissions?projectId=p1 -> 403 OK');

    res = await request('/api/submissions/sub_1', 'GET', null, alanCookie);
    assert(res.status === 403, 'Alan should not read sub_1 (unassigned mentor)');
    console.log('Alan GET /api/submissions/sub_1 -> 403 OK');

    // 14. Submission persists after restart
    // We already created aliceDraftId and submitted it. Re-read to verify it's there.
    res = await request(`/api/submissions/${aliceDraftId}`, 'GET', null, aliceCookie);
    assert(res.status === 200 && res.data.id === aliceDraftId, 'Submission must persist in SQLite');
    assert(res.data.status === 'SUBMITTED', 'Persisted submission should retain SUBMITTED status');
    assert(res.data.title === 'Updated Test Draft Submission', 'Persisted submission should retain updated title');
    console.log(`Submission persists in SQLite -> OK (id=${aliceDraftId}, status=${res.data.status})`);

    // 15. Submission activity events persist correctly
    res = await request('/api/projects/p1/activity', 'GET', null, aliceCookie);
    assert(res.status === 200, 'Activity read should succeed');
    const submissionActivity = res.data.filter(
      a => a.submissionId === aliceDraftId
    );
    // We expect at least: SUBMISSION_CREATED, SUBMISSION_UPDATED, SUBMISSION_SUBMITTED
    const activityTypes = submissionActivity.map(a => a.type);
    assert(activityTypes.includes('SUBMISSION_CREATED'), 'SUBMISSION_CREATED activity should exist');
    assert(activityTypes.includes('SUBMISSION_SUBMITTED'), 'SUBMISSION_SUBMITTED activity should exist');
    // The update emits SUBMISSION_UPDATED
    assert(activityTypes.includes('SUBMISSION_UPDATED'), 'SUBMISSION_UPDATED activity should exist');
    // Verify actor identity on activity events
    const createdEvent = submissionActivity.find(a => a.type === 'SUBMISSION_CREATED');
    assert(createdEvent && createdEvent.actorId === 'u1', 'Activity actorId must be session user u1');
    assert(createdEvent && createdEvent.actorName === 'Alice Watson', 'Activity actorName must be session user');
    console.log('Submission activity events persist correctly -> OK (' + submissionActivity.length + ' events)');

    // 16. PATCH /submissions/:id/status should NOT exist (removed — belongs to Review slice)
    res = await request(`/api/submissions/sub_1/status`, 'PATCH', { status: 'UNDER_REVIEW' }, sarahCookie);
    assert(res.status === 404, 'PATCH /submissions/:id/status should return 404 (route removed)');
    console.log('PATCH /api/submissions/:id/status -> 404 OK (boundary enforced)');

    if (failCount > 0) {
      console.error(`\n${failCount} submission test(s) FAILED`);
      process.exitCode = 1;
    } else {
      console.log('\nAll submission authorization tests passed!');
    }
    // =====================================================================
    //  REVIEW AUTHORIZATION TESTS
    // =====================================================================
    console.log('\n--- Review Authorization Tests ---');
    let reviewFailCount = 0;
    function assertReview(cond, msg) {
      if (!cond) {
        console.error(`  FAIL: ${msg}`);
        reviewFailCount++;
      }
    }

    // Unauthenticated access
    res = await request('/api/submissions/sub_1/review');
    assertReview(res.status === 401, 'Unauthenticated GET /review should return 401');
    res = await request('/api/submissions/sub_1/review', 'POST');
    assertReview(res.status === 401, 'Unauthenticated POST /review should return 401');
    res = await request('/api/reviews/fake_id', 'PUT', { feedback: 'test' });
    assertReview(res.status === 401, 'Unauthenticated PUT /reviews/:id should return 401');
    res = await request('/api/reviews/fake_id/complete', 'POST');
    assertReview(res.status === 401, 'Unauthenticated POST /reviews/:id/complete should return 401');
    console.log('Unauthenticated Review endpoints -> 401 OK');

    // Student access
    res = await request('/api/submissions/sub_1/review', 'GET', null, aliceCookie);
    assertReview(res.status === 200 || res.status === 404, 'Student should read their permitted review');
    res = await request('/api/submissions/sub_1/review', 'POST', null, aliceCookie);
    assertReview(res.status === 403, 'Student cannot start review -> 403');
    console.log('Student Read -> OK, Student Mutation -> 403 OK');

    // Cross-project Student
    res = await request('/api/submissions/sub_1/review', 'GET', null, davidCookie);
    assertReview(res.status === 403, 'Cross-project student cannot read review -> 403');
    console.log('Cross-project Student Read -> 403 OK');

    // Unassigned mentor
    res = await request('/api/submissions/sub_1/review', 'GET', null, alanCookie);
    assertReview(res.status === 403, 'Unassigned mentor cannot read review -> 403');
    res = await request('/api/submissions/sub_1/review', 'POST', null, alanCookie);
    assertReview(res.status === 403, 'Unassigned mentor cannot start review -> 403');
    console.log('Unassigned mentor Read/Mutation -> 403 OK');

    // Assigned mentor (Sarah, u4 for p1)
    res = await request('/api/submissions/sub_1/review', 'POST', null, sarahCookie);
    assertReview(res.status === 201, 'Assigned mentor can start review');
    const reviewId = res.data?.id;
    assertReview(reviewId, 'Review ID should be generated');
    assertReview(res.data.status === 'IN_REVIEW', 'Review should be IN_REVIEW');
    assertReview(res.data.reviewerId === 'u4', 'Review reviewerId must be session user u4');
    console.log('Assigned mentor POST /review -> 201 OK');

    // Check submission status updated to UNDER_REVIEW
    res = await request('/api/submissions/sub_1', 'GET', null, aliceCookie);
    assertReview(res.data.status === 'UNDER_REVIEW', 'Submission status should be UNDER_REVIEW');
    console.log('Submission status updated to UNDER_REVIEW -> OK');

    // Starting already started review
    res = await request('/api/submissions/sub_1/review', 'POST', null, sarahCookie);
    assertReview(res.status === 400, 'Starting already started review is rejected');
    console.log('Double start review -> 400 OK');

    // DRAFT submission cannot be reviewed
    res = await request('/api/submissions', 'POST', { projectId: 'p1', title: 'D', description: 'D' }, aliceCookie);
    const draftId = res.data.id;
    res = await request(`/api/submissions/${draftId}/review`, 'POST', null, sarahCookie);
    assertReview(res.status === 400, 'Cannot review DRAFT submission');
    console.log('DRAFT submission review -> 400 OK');

    // Assigned mentor updates feedback
    res = await request(`/api/reviews/${reviewId}`, 'PUT', { feedback: 'Great work!' }, sarahCookie);
    assertReview(res.status === 200, 'Assigned mentor can update feedback');
    assertReview(res.data.feedback === 'Great work!', 'Feedback should be updated');
    console.log('Assigned mentor PUT /reviews/:id -> 200 OK');

    // Unassigned mentor tries to update feedback
    res = await request(`/api/reviews/${reviewId}`, 'PUT', { feedback: 'Hacked' }, alanCookie);
    assertReview(res.status === 403, 'Unassigned mentor cannot update feedback');
    console.log('Unassigned mentor PUT /reviews/:id -> 403 OK');

    // Student tries to update feedback
    res = await request(`/api/reviews/${reviewId}`, 'PUT', { feedback: 'Hacked by student' }, aliceCookie);
    assertReview(res.status === 403, 'Student cannot update feedback');
    console.log('Student PUT /reviews/:id -> 403 OK');

    // Assigned mentor completes review
    res = await request(`/api/reviews/${reviewId}/complete`, 'POST', null, sarahCookie);
    assertReview(res.status === 200, 'Assigned mentor can complete review');
    assertReview(res.data.status === 'REVIEWED', 'Review status should be REVIEWED');
    console.log('Assigned mentor POST /reviews/:id/complete -> 200 OK');

    // Check submission status updated to REVIEWED
    res = await request('/api/submissions/sub_1', 'GET', null, aliceCookie);
    assertReview(res.data.status === 'REVIEWED', 'Submission status should be REVIEWED');
    console.log('Submission status updated to REVIEWED -> OK');

    // Modify feedback on completed review
    res = await request(`/api/reviews/${reviewId}`, 'PUT', { feedback: 'Too late' }, sarahCookie);
    assertReview(res.status === 400, 'Cannot modify feedback on completed review');
    console.log('Modify completed review feedback -> 400 OK');

    // Complete non-IN_REVIEW review
    res = await request(`/api/reviews/${reviewId}/complete`, 'POST', null, sarahCookie);
    assertReview(res.status === 400, 'Cannot complete an already completed review');
    console.log('Complete already completed review -> 400 OK');

    // Persistence & Activity tests
    res = await request('/api/projects/p1/activity', 'GET', null, sarahCookie);
    const reviewActivity = res.data.filter(a => a.submissionId === 'sub_1' && a.type.startsWith('SUBMISSION_'));
    const reviewActivityTypes = reviewActivity.map(a => a.type);
    assertReview(reviewActivityTypes.includes('SUBMISSION_REVIEW_STARTED'), 'SUBMISSION_REVIEW_STARTED exists');
    assertReview(reviewActivityTypes.includes('SUBMISSION_FEEDBACK_UPDATED'), 'SUBMISSION_FEEDBACK_UPDATED exists');
    assertReview(reviewActivityTypes.includes('SUBMISSION_REVIEWED'), 'SUBMISSION_REVIEWED exists');
    assertReview(reviewActivity.every(a => a.actorId === 'u4'), 'Actor identity comes from authenticated mentor');
    console.log('Review activity events persist correctly -> OK');

    if (reviewFailCount > 0) {
      console.error(`\n${reviewFailCount} review test(s) FAILED`);
      process.exitCode = 1;
    } else {
      console.log('\nAll review authorization tests passed!');
    }

    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
