## Diagnosis

The button is working, but the request is rejected by the backend with **401 Unauthorized**.

Root cause: regular lesson/topic requests send these fields to `get-data`:

```text
phone + device_id
```

But `YakuniyTestPage.tsx` calls `get-data` like this:

```text
action: 'random-final-test'
```

So the backend function sees missing `phone` / `device_id` and returns 401. That is why clicking **Testni boshlash** appears to do nothing.

## Plan

1. Update the Yakuniy test start request to include the saved `phone_number` and `device_id` from localStorage.
2. If either value is missing, send the user back to the auth screen instead of silently failing.
3. Add a visible error message on the Yakuniy page when loading questions fails, so students do not see “nothing happened”.
4. Keep the existing backend security check unchanged: only logged-in phone + device pairs can load the final test.

## Files to change

- `src/pages/YakuniyTestPage.tsx`

## Expected result

After this change, users who are logged in on their registered device can press **Testni boshlash** and the final test questions should load instead of returning 401.