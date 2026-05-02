UPDATE repositories SET description = description || ' ' WHERE "fullName" = 'Huzaifa-12Imran/ImpactTracker';
DELETE FROM impact_scores WHERE "repositoryId" IN (SELECT id FROM repositories WHERE "fullName" = 'Huzaifa-12Imran/ImpactTracker');
