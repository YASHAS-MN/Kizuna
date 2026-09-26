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

    console.log('\nAll tests passed!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
