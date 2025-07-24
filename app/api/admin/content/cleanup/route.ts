import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { withErrorHandling } from '@/lib/apiHandler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Clean up content sections - keep only the 4 essential ones
async function handlePost(req: NextRequest) {
  try {
    console.log('🧹 Starting content cleanup...');
    
    // Define the sections we want to keep
    const keepSections = ['hero-subtitle', 'about-description', 'hero-title', 'about-title'];
    
    // Get all content documents
    const contentRef = db.collection('content');
    const snapshot = await contentRef.get();
    
    console.log(`📊 Found ${snapshot.docs.length} total content documents`);
    
    // Group documents by section name
    const sectionGroups: { [key: string]: any[] } = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const section = data.section;
      
      if (!sectionGroups[section]) {
        sectionGroups[section] = [];
      }
      
      sectionGroups[section].push({
        id: doc.id,
        data: data,
        hasTestPrefix: data.content?.toLowerCase().startsWith('test')
      });
    });
    
    console.log('📋 Section groups found:', Object.keys(sectionGroups));
    
    let deletedCount = 0;
    let keptCount = 0;
    
    // Process each section group  
    for (const [sectionName, documents] of Object.entries(sectionGroups)) {
      console.log(`\n🔍 Processing section "${sectionName}" with ${documents.length} documents`);
      
      // If this section is not in our keep list, delete all documents
      if (!keepSections.includes(sectionName)) {
        console.log(`🗑️ Section "${sectionName}" not in keep list, deleting all ${documents.length} documents`);
        for (const doc of documents) {
          await db.collection('content').doc(doc.id).delete();
          deletedCount++;
        }
        continue;
      }
      
      // For sections we want to keep, find the best document
      if (documents.length === 1) {
        console.log(`✅ Only one document for "${sectionName}", keeping it`);
        keptCount++;
        continue;
      }
      
      // Find the document with "test" prefix
      const testDocument = documents.find(doc => doc.hasTestPrefix);
      const nonTestDocuments = documents.filter(doc => !doc.hasTestPrefix);
      
      if (testDocument) {
        console.log(`✅ Found test-prefixed document for "${sectionName}", keeping it`);
        keptCount++;
        
        // Delete all non-test documents
        for (const doc of nonTestDocuments) {
          console.log(`🗑️ Deleting duplicate document ${doc.id}`);
          await db.collection('content').doc(doc.id).delete();
          deletedCount++;
        }
      } else {
        // If no test document, keep the most recently updated one
        const sortedDocs = documents.sort((a, b) => {
          const aTime = a.data.updatedAt?.toDate?.() || a.data.createdAt?.toDate?.() || new Date(0);
          const bTime = b.data.updatedAt?.toDate?.() || b.data.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        
        const keepDoc = sortedDocs[0];
        const deleteDocuments = sortedDocs.slice(1);
        
        console.log(`✅ No test document for "${sectionName}", keeping most recent: ${keepDoc.id}`);
        keptCount++;
        
        for (const doc of deleteDocuments) {
          console.log(`🗑️ Deleting duplicate document ${doc.id}`);
          await db.collection('content').doc(doc.id).delete();
          deletedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed:`);
    console.log(`✅ Documents kept: ${keptCount}`);
    console.log(`🗑️ Documents deleted: ${deletedCount}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Content cleanup completed successfully',
      summary: {
        documentsKept: keptCount,
        documentsDeleted: deletedCount,
        sectionsProcessed: Object.keys(sectionGroups).length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ Error during content cleanup:', error);
    throw error;
  }
}

export const POST = withErrorHandling(handlePost);