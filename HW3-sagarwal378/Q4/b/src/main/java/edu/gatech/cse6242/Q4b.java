package edu.gatech.cse6242;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.KeyValueTextInputFormat;
import org.apache.hadoop.mapreduce.lib.jobcontrol.ControlledJob;
import org.apache.hadoop.mapreduce.lib.jobcontrol.JobControl;
import java.io.IOException;

public class Q4b {

  public static class TaxiDataMapper
       extends Mapper<Object, Text, Text, DoubleWritable>{

    private Text PassengerCount = new Text();
    private DoubleWritable TotalFare = new DoubleWritable();

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      String[] itr = value.toString().split("\t");
      PassengerCount.set(itr[2]);
      TotalFare.set(Double.parseDouble(itr[3]));

      context.write(PassengerCount, TotalFare);
    }
  }

  public static class AvgFareReducer
       extends Reducer<Text,DoubleWritable,Text,DoubleWritable> {

    private Text result = new Text();
    public void reduce(Text key, Iterable<DoubleWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      double fare = 0;
      int count = 0;
      for (DoubleWritable val : values) {
        fare  += val.get();
        count += 1;
      }
      fare = fare/count;
      fare = Math.round(fare*100.0)/100.0;
      context.write(key, new DoubleWritable(fare));
    }
  }

  public static void main(String[] args) throws Exception {

    /* TODO: Update variable below with your gtid */
    final String gtid = "sagarwal378";

    JobControl jobControl = new JobControl("jobChain");
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q4b");
    job.setJarByClass(Q4b.class);
    job.setMapperClass(TaxiDataMapper.class);
    job.setReducerClass(AvgFareReducer.class);
    job.setMapOutputKeyClass(Text.class);
	job.setMapOutputValueClass(DoubleWritable.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(DoubleWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));


    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
